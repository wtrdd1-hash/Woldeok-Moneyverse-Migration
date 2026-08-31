-- 14.4's last unchecked line: 사업 구매 시 자기자본 최소 30% 적용.
--
-- 096 stopped exactly here and said why: "14.4 also asks that borrowed money
-- be barred from stock purchases and transfers. Cash is fungible and the
-- ledger does not colour it, so that needs a rule about the whole balance
-- rather than about the loan -- a separate decision, and one this migration
-- would be the wrong place to invent." A business purchase is the one place
-- 14.4 states that decision as a number, so it is the one place the
-- whole-balance rule can be written without inventing policy: at least 30% of
-- what a member pays for a business has to be their own.
--
-- WHAT 자기자본 IS HERE, EXACTLY.
--   + USER_CASH and USER_BANK, from `account_balances`
--   + stock positions, marked at `virtual_stocks.current_price`
--   - everything still owed on an open or overdue loan
-- and nothing else. Each of those is a decision, not an oversight.
--
-- Deposits count because moving money into the bank is not spending it, and a
-- rule that one `bank_move_balance` could step around would be theatre.
-- Positions count for the mirror reason: 023 lets a member keep their savings
-- as a position, and ignoring them would push a saver out of the market to buy
-- a shop. They are marked to market exactly as 032's net worth tax marks them,
-- so the two cannot come to disagree about what a portfolio is worth.
--
-- Businesses already owned do NOT count. Nothing in 036 sells one back, so a
-- business is not capital a member can put behind the next purchase; counting
-- it would let the first shop finance the second and the second the third,
-- which is 16.2's ladder skipped rather than climbed.
--
-- The whole outstanding balance is subtracted, not the principal alone. Two
-- reasons. 자기자본 is assets minus liabilities, and the interest 096 fixes at
-- issue is a liability from that moment. And the alternative needs an
-- allocation this schema does not record: `bank_repay` decrements one
-- `outstanding_amount` that already contains the interest, so after a partial
-- repayment "how much principal is left" is a guess -- least(outstanding,
-- principal) and outstanding-minus-interest disagree, and neither is written
-- down anywhere. Subtracting what is actually owed needs no guess. It is
-- stricter than counting principal alone by at most one loan's interest,
-- because 076's unique index allows a member only one open loan.
--
-- WHY THE PRICE IS READ FROM THE LEDGER, AND ADDED BACK. `business_purchase`
-- posts the payment and then inserts the ownership, so by the time this
-- trigger runs the price has already left the member's balance -- which is why
-- the guard adds it back before comparing. It adds back what `ledger_postings`
-- says left this member's accounts under `NEW.purchase_transaction_id`, and
-- not `virtual_business_types.purchase_cost`: the amount a member must hold
-- 30% of is the amount they were charged, and 038 lets an operator edit a
-- catalogue price. A transaction that took nothing from this member -- a
-- grant, a correction -- has no price to be 30% of and is left alone.
--
-- WHY THE GUARD CROSS-MULTIPLIES. It compares own capital x 10000 against
-- price x 3000 and never divides. 100 records the reason from the casino: a
-- floored share compares as meeting a bound it is actually under -- 1/6
-- floored to 166,666 ppm passed a zero-edge test -- and a 30% rule that
-- accepts 29.99% is that same hole in a different table.
--
-- WHY A SECOND TRIGGER ON THE SAME TABLE. 101 already hangs
-- `virtual_business_ownerships_unlock_gate` here for 16.1's job levels, and
-- this is not that rule: one is about what a member has learned, the other
-- about whose money this is. So it gets its own name and its own function, and
-- both fire. PostgreSQL runs BEFORE ROW triggers in name order, so the equity
-- gate runs first; nothing depends on that, because when both hold both
-- refusals are true, and the businesses screen names the level first -- a
-- level is not something today's balance can fix. A trigger and not a check
-- inside `business_purchase`, for the reason 096 gives about the casino debt
-- block: the purchase function is long, a check would have to cover every path
-- through it, and a trigger covers a path added later as well.
--
-- WHAT THIS TAKES AWAY. It refuses purchases that succeed today. A member
-- holding 9,000 WLD of which 8,480 is an open loan may buy the 8,000 WLD
-- 소형 배달소 right now, and after this they may not. The C grade cannot reach
-- that state at all -- 096 caps it at 2,000 and the cheapest business is
-- 3,000, so 70% of any price is already more than C lends -- which means the
-- members this touches are the B and A grades: exactly the ones 16.2 and 16.3
-- expect to be borrowing to expand. Ownerships that already exist are
-- untouched; the trigger is on INSERT.

BEGIN;

-- What a member's own capital is -- as the screen has to say it before the
-- button is pressed, and as the guard below has to test it. One function, so
-- the two cannot drift apart, and it returns the ratio as well as the money for
-- the same reason: a 30% written in the trigger and again in TypeScript is one
-- rule stored twice, and only one of the two copies gets refused when it is
-- wrong.
--
-- It answers zeros for an actor with no accounts rather than returning no row.
-- The trigger reads it, and a function that answered nothing for some member
-- would turn a refusal into a silent pass. Nothing here is anyone else's data:
-- every branch is keyed on p_actor.
CREATE OR REPLACE FUNCTION public.business_equity_standing(p_actor uuid)
RETURNS TABLE(
  holdings_amount bigint,
  debt_amount bigint,
  equity_amount bigint,
  minimum_ratio_bps integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  WITH wallet AS (
    SELECT coalesce(sum(balance_row.available_amount), 0)::bigint AS held
    FROM public.accounts AS account_row
    JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
    WHERE account_row.owner_user_id = p_actor
      AND account_row.status = 'active'::public.account_status
      AND account_row.account_type IN (
        'USER_CASH'::public.account_type, 'USER_BANK'::public.account_type
      )
  ),
  portfolio AS (
    SELECT coalesce(sum(position_row.quantity * stock_row.current_price), 0)::bigint AS held
    FROM public.virtual_stock_positions AS position_row
    JOIN public.virtual_stocks AS stock_row ON stock_row.id = position_row.stock_id
    WHERE position_row.user_id = p_actor
  ),
  owed AS (
    SELECT coalesce(sum(loan_row.outstanding_amount), 0)::bigint AS balance
    FROM public.virtual_bank_loans AS loan_row
    WHERE loan_row.user_id = p_actor
      AND loan_row.status IN ('active', 'overdue')
  )
  SELECT wallet.held + portfolio.held,
         owed.balance,
         wallet.held + portfolio.held - owed.balance,
         -- 14.4's 30%, in basis points: the guard multiplies by this rather
         -- than dividing by a percent, and a later policy that wants half a
         -- point has somewhere to put it.
         3000
  FROM wallet, portfolio, owed
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

  IF v_price <= 0 THEN
    RETURN NEW;
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

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.virtual_business_ownerships'::pg_catalog.regclass
      AND trigger_row.tgname = 'virtual_business_ownerships_equity_gate'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER virtual_business_ownerships_equity_gate
      BEFORE INSERT ON public.virtual_business_ownerships
      FOR EACH ROW
      EXECUTE FUNCTION public.business_refuse_without_equity();
  END IF;
END;
$do$;

ALTER FUNCTION public.business_equity_standing(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.business_refuse_without_equity() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.business_equity_standing(uuid),
  public.business_refuse_without_equity() FROM PUBLIC, moneyverse_app;

-- The read, and only the read. The trigger function is called by its trigger,
-- never by the application.
GRANT EXECUTE ON FUNCTION public.business_equity_standing(uuid) TO moneyverse_app;

-- Restated, so this migration cannot later be read as having relaxed the
-- boundary it works around. `accounts`, `account_balances` and
-- `ledger_postings` are deliberately absent from this list: 005 left the
-- application SELECT on those three and the wallet reads them directly, so
-- revoking them here would take a working screen down rather than restate
-- anything.
REVOKE ALL PRIVILEGES ON TABLE public.virtual_bank_loans, public.virtual_stocks,
  public.virtual_stock_positions, public.virtual_business_ownerships
  FROM PUBLIC, moneyverse_app;

COMMIT;
