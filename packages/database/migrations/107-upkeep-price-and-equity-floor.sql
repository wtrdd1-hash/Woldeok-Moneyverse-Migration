BEGIN;

-- Two figures a member is shown that were not the figures they are charged,
-- and one gate that read "charged nothing" as "requirement met".
--
-- THE SCREEN PRICED A HOLDING PER UNIT AND THE JOB BILLS IT PER HOLDING.
-- `shop_charge_weekly_upkeep` (104) computes `maintenance_cost * quantity`;
-- `shop_my_items` reported `maintenance_cost` alone. A member holding three
-- of a 100 WLD item read 100 on the card and was charged 300. The arrears
-- ceiling had the same shape and was worse: four weeks of the per-unit price
-- is 400, which a per-holding charge of 300 passes in the second week, so a
-- cap meant to stop a debt growing was already behind the debt.
--
-- Both now multiply by the quantity, which is what the charge does. The
-- alternative -- charging per holding regardless of how many are in it --
-- would make the second copy of an item free, and 17.4 prices these things
-- per item.
--
-- AND THE EQUITY GATE FAILED OPEN ON A ZERO PRICE. 105 read the WLD this
-- member actually paid out of the purchase transaction, and returned NEW when
-- that came to nothing. Nothing in this schema hands a business over for
-- free: 036 refuses a catalogue price under 100 and `business_purchase` is the
-- only writer of `virtual_business_ownerships`. A price of zero therefore
-- means the transaction posted no movement, and a rule about 30% of a price
-- must not read that as satisfied.
--
-- To be exact about the danger, because the reviewer who found this described
-- a way in that does not exist: reaching the branch needs a purchase whose
-- idempotency key already named some other transaction, and 045's
-- `economy_post_transaction` refuses a key reused for a different request
-- before it gets here -- confirmed on the test database, where the attempt is
-- turned away with 'idempotency key was reused with a different request'. So
-- this is a second lock on a door that already has one, which is the right
-- number of locks for a rule about who may own what.

CREATE OR REPLACE FUNCTION public.shop_my_items(p_actor uuid)
RETURNS TABLE(
  catalog_id uuid,
  code text,
  name text,
  quantity integer,
  acquired_at timestamptz,
  expires_at timestamptz,
  effect_kind public.shop_effect_kind,
  durable boolean,
  weekly_cost bigint,
  effect_expires_at timestamptz,
  unpaid_weeks integer,
  arrears_due bigint,
  arrears_cap bigint,
  suspended boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT held.catalog_id,
         catalogue.code,
         catalogue.name,
         held.quantity,
         held.acquired_at,
         held.expires_at,
         catalogue.effect_kind,
         (catalogue.holding_duration_days IS NOT NULL OR catalogue.maintenance_cost > 0),
         catalogue.maintenance_cost * held.quantity,
         (SELECT max(receipt.expires_at)
          FROM public.item_effect_receipts AS receipt
          WHERE receipt.user_id = held.user_id
            AND receipt.catalog_id = held.catalog_id
            AND receipt.expires_at > pg_catalog.clock_timestamp()),
         coalesce(owed.unpaid_weeks, 0),
         coalesce(owed.amount_due, 0),
         catalogue.maintenance_cost * held.quantity * public.shop_upkeep_grace_weeks(),
         coalesce(owed.suspended, false)
  FROM public.user_items AS held
  JOIN public.shop_catalog AS catalogue ON catalogue.id = held.catalog_id
  LEFT JOIN public.shop_upkeep_arrears AS owed
    ON owed.user_id = held.user_id AND owed.catalog_id = held.catalog_id
  WHERE held.user_id = p_actor
    AND held.quantity > 0
    AND (held.expires_at IS NULL OR held.expires_at > pg_catalog.clock_timestamp())
  ORDER BY held.acquired_at DESC, held.catalog_id
$$;
CREATE OR REPLACE FUNCTION public.business_refuse_without_equity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_price bigint;
  v_equity bigint;
  v_bps integer;
  v_required bigint;
BEGIN
  -- What left this member's accounts for this purchase. A credit lowers a
  -- member's balance and a debit raises it (init/001-economy-core.sql), so the
  -- net credit is what they paid; a transaction that handed them the business
  -- rather than charging for it nets zero or less.
  SELECT coalesce(sum(
           CASE WHEN posting_row.direction = 'credit'::public.posting_direction
                THEN posting_row.amount
                ELSE -posting_row.amount END), 0)::bigint
  INTO v_price
  FROM public.ledger_postings AS posting_row
  JOIN public.accounts AS account_row ON account_row.id = posting_row.account_id
  WHERE posting_row.transaction_id = NEW.purchase_transaction_id
    AND account_row.owner_user_id = NEW.user_id;

  -- Fails closed, like the NULL branch below it. Nothing in this schema hands
  -- a business over for nothing: 036 refuses a catalogue price under 100 and
  -- `business_purchase` is the only writer of this table. So a purchase that
  -- charged this member nothing is not generosity, it is a transaction that
  -- posted no movement -- and a rule about 30% of the price must not read a
  -- price of zero as satisfied. 045's request-hash check already refuses a key
  -- reused for a different request, which is what would have to happen to get
  -- here; this is the second lock on a door that already has one.
  IF v_price <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'this purchase charged the member nothing';
  END IF;

  SELECT standing_row.equity_amount, standing_row.minimum_ratio_bps
  INTO v_equity, v_bps
  FROM public.business_equity_standing(NEW.user_id) AS standing_row;

  -- Fails closed. The read above always returns one row today; if a later
  -- change ever made it return none, a NULL comparison is false and this guard
  -- would pass every purchase without anybody noticing.
  IF v_equity IS NULL OR v_bps IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'own capital could not be determined';
  END IF;

  -- The payment is already posted, so this is the standing the member bought
  -- from rather than the one they are left with.
  v_equity := v_equity + v_price;

  IF v_equity::numeric * 10000 < v_price::numeric * v_bps THEN
    v_required := pg_catalog.ceil(v_price::numeric * v_bps / 10000)::bigint;
    -- Both figures, because a 409 reaches a member as a fixed Korean sentence
    -- (frontend/src/lib/mutate.ts) and this message is what an operator reads
    -- when somebody asks why. The screen states the same two before the button
    -- is pressed.
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = pg_catalog.format(
        'this business needs %s WLD of own capital and this member has %s',
        v_required, v_equity);
  END IF;

  RETURN NEW;
END;
$$;
ALTER FUNCTION public.shop_my_items(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.business_refuse_without_equity() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.shop_my_items(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.business_refuse_without_equity() FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.shop_my_items(uuid) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.user_items FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.shop_upkeep_arrears FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.virtual_business_ownerships FROM PUBLIC, moneyverse_app;

COMMIT;
