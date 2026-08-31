-- The item lifecycle the shop has never had: an effect that runs and ends,
-- an upkeep that is actually charged, and a holding that stops being held.
--
-- WHAT THE AUDIT FOUND, AND WHAT WAS ACTUALLY MISSING. Three gaps were
-- reported. One of them is already closed and this migration does not touch
-- it: `shop_use_item` has had a route since the game screens landed --
-- `POST /api/v1/shop/holdings/{id}/consumptions`, `ShopCatalogRepository.use`
-- and the 1개 사용하기 control on /shop/catalog. What that route did NOT have
-- is anything for the effect to mean: every receipt it wrote carried a null
-- `expires_at`, so an effect began and never ended, and nothing stopped a
-- member spending five 시장 분석권 in a row for one seven-day benefit.
--
-- The other two gaps are real. 075 added `maintenance_cost` and
-- `shop_maintenance_receipts` and no function that writes one, so the 주간
-- 관리비 on a 사무실 임대권 was a number on a card. And `user_items.expires_at`
-- and `item_effect_receipts.expires_at` have existed since 071 with no writer
-- and no reader -- chapter 20 asks both tables for 만료, and neither had it.
--
-- WHAT A TERM IS, AND WHERE THE NUMBERS COME FROM. Two different clocks, and
-- the specification names both:
--
--   * 17.3 prices 배달 계약 and 사업 보험 as 기간제 with the term in the
--     effect itself -- "운송 관련 정산 보너스 7일", "이벤트 손실 50% 완화
--     7일". Those are held for a week and then gone: `holding_duration_days`.
--   * 17.2 gives 시장 분석권 "NPC 주문 정보 7일 제공", 17.3 gives 사업 재고
--     묶음 "소규모 사업 1일 운영" and 17.1 gives 노점 재고 상자 "노점 1일
--     정상 운영 재료". Those are spent and their effect runs for a while:
--     `effect_duration_days`.
--
-- No other item is given a term. A 사무실 임대권 has a weekly upkeep and no
-- stated term anywhere in the specification, and inventing one would decide
-- by hand that an 80,000 WLD purchase evaporates on a day nobody chose.
--
-- EXPIRY IS A PREDICATE, NOT A SWEEP. Nothing walks `user_items` at 04:00 to
-- retire rows. `shop_my_items` stops returning an expired holding and
-- `shop_use_item` refuses one, so the answer is right the instant the term
-- ends rather than right after the next sweep -- and a sweep that fails for a
-- week cannot leave a member holding something they should not. The upkeep
-- below is the opposite case and does need a job, because charging money is
-- an event and not a reading.
--
-- A MEMBER WHO CANNOT PAY IS NOT FORECLOSED ON. 16.4: "밀린 유지비를 무한
-- 누적하지 않고 상한 적용" -- an unpaid upkeep must not accumulate without
-- bound, and the cap is a requirement. So the debt stops growing at four
-- weeks of that holding's own upkeep, and at that ceiling the holding is
-- SUSPENDED rather than repossessed or expired. The same section asks for
-- "기본 도구 수리와 사업 재가동 지원" for a member coming back, which
-- presumes their things are still there to restart; destroying a 45,000 WLD
-- 소형 화물차 over 3,600 WLD of missed upkeep would make that sentence
-- impossible to honour. `shop_settle_upkeep` is how they restart, and the
-- weekly job settles the arrears on its own the first week the member can
-- afford them.

BEGIN;

-- Four weeks, in one place.
--
-- The number is both the ceiling on the debt and the grace before a holding
-- is suspended, and the job and the read model would otherwise each carry
-- their own copy of it -- which is how a screen ends up promising a ceiling
-- the charge does not apply.
CREATE OR REPLACE FUNCTION public.shop_upkeep_grace_weeks()
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT 4
$$;

ALTER FUNCTION public.shop_upkeep_grace_weeks() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_upkeep_grace_weeks() FROM PUBLIC, moneyverse_app;

ALTER TABLE public.shop_catalog
  ADD COLUMN effect_duration_days integer
    CHECK (effect_duration_days IS NULL OR effect_duration_days BETWEEN 1 AND 365),
  ADD COLUMN holding_duration_days integer
    CHECK (holding_duration_days IS NULL OR holding_duration_days BETWEEN 1 AND 365);

-- 17.2 and 17.1/17.3: the three items whose effect is stated in days.
UPDATE public.shop_catalog SET effect_duration_days = 7 WHERE code = 'market_pass';
UPDATE public.shop_catalog SET effect_duration_days = 1
  WHERE code IN ('business_stock', 'stall_crate');

-- 17.3: the two 기간제 rows, whose seven days are the holding's own.
UPDATE public.shop_catalog SET holding_duration_days = 7
  WHERE code IN ('delivery_contract', 'business_insurance');

-- What a member owes on one holding, and whether it still works.
--
-- Separate from `shop_maintenance_receipts` because the two record opposite
-- facts: a receipt is a week that was paid and is never revised, and this is
-- a running total that is cleared the moment it is settled. Keeping the debt
-- in the receipts table would have meant either a receipt for money that
-- never moved or a receipt that gets edited.
CREATE TABLE public.shop_upkeep_arrears (
  user_id uuid NOT NULL REFERENCES public.users(id),
  catalog_id uuid NOT NULL REFERENCES public.shop_catalog(id),
  unpaid_weeks integer NOT NULL DEFAULT 0 CHECK (unpaid_weeks >= 0),
  amount_due bigint NOT NULL DEFAULT 0 CHECK (amount_due >= 0),
  suspended boolean NOT NULL DEFAULT false,
  first_missed_week date NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  PRIMARY KEY (user_id, catalog_id)
);

ALTER TABLE public.shop_upkeep_arrears OWNER TO moneyverse_migrator;

-- Every read of an effect asks the same question: is one of this member's
-- receipts for this item still running?
CREATE INDEX IF NOT EXISTS item_effect_receipts_running
  ON public.item_effect_receipts (user_id, catalog_id, expires_at DESC);

-- The term is a property of the catalogue row, so it is stamped where the
-- holding is written rather than in each of the writers.
--
-- A trigger rather than a change to `shop_purchase_catalog`: the term has to
-- hold for every writer of `user_items`, and re-emitting 072's hundred lines
-- to add one assignment is how a transcription error gets into the function
-- that takes money.
--
-- Only when the count goes UP. The decrement in `shop_use_item` and any later
-- correction must not push the expiry out, or an item could be kept alive for
-- ever by consuming it. Buying another one does restart the term for the whole
-- holding: 071 keeps one row per member and item, so there is nowhere to put a
-- second expiry, and the generous reading is the one a member can predict.
CREATE OR REPLACE FUNCTION public.shop_stamp_item_term()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_days integer;
BEGIN
  -- Nested rather than `TG_OP = 'UPDATE' AND NEW.quantity <= OLD.quantity`:
  -- plpgsql hands the whole condition to the executor, which does not promise
  -- to stop at the left operand, and OLD is unassigned on an INSERT.
  IF TG_OP = 'UPDATE' THEN
    IF NEW.quantity <= OLD.quantity THEN
      RETURN NEW;
    END IF;
  END IF;

  SELECT catalog_row.holding_duration_days INTO v_days
  FROM public.shop_catalog AS catalog_row
  WHERE catalog_row.id = NEW.catalog_id;

  IF v_days IS NOT NULL THEN
    NEW.expires_at := pg_catalog.clock_timestamp() + v_days * interval '1 day';
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.shop_stamp_item_term() OWNER TO moneyverse_migrator;
-- Called by the trigger, never by the application.
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_stamp_item_term() FROM PUBLIC, moneyverse_app;

DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger AS trigger_row
    WHERE trigger_row.tgrelid = 'public.user_items'::pg_catalog.regclass
      AND trigger_row.tgname = 'user_items_stamp_term'
      AND NOT trigger_row.tgisinternal
  ) THEN
    CREATE TRIGGER user_items_stamp_term
      BEFORE INSERT OR UPDATE ON public.user_items
      FOR EACH ROW EXECUTE FUNCTION public.shop_stamp_item_term();
  END IF;
END;
$do$;

-- Consuming an item, with the two things 074 left out.
--
-- 074's rules are unchanged: the replay branch, the 28000 for somebody else's
-- receipt, the 22023 for an item nobody owns, and only a `convenience` item
-- may be consumed. Every relation is still aliased and every column still
-- qualified, because `catalog_id`, `remaining_quantity` and `expires_at` are
-- OUT parameters as well as column names and plpgsql defaults to
-- variable_conflict = error.
--
-- WHAT IS NEW. The receipt now carries the term the catalogue gives the
-- effect, and a second use is refused while the first is still running --
-- chapter 20 asks `item_effect_receipts` for 적용·만료 and 중복 방지, and
-- without the expiry there was nothing for the duplicate check to compare
-- against. And a durable holding is refused outright: a 소형 화물차 is
-- `convenience` like everything else useful, so before this a member could
-- destroy a 45,000 WLD vehicle by pressing 사용하기, which is not a decision
-- this product should let a single click make.
CREATE OR REPLACE FUNCTION public.shop_use_item(
  p_key uuid,
  p_actor uuid,
  p_catalog uuid
)
RETURNS TABLE(
  catalog_id uuid,
  remaining_quantity integer,
  expires_at timestamptz,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_owner uuid;
  v_catalog uuid;
  v_quantity integer;
  v_kind public.shop_effect_kind;
  v_effect_days integer;
  v_holding_days integer;
  v_upkeep bigint;
  v_item_expires timestamptz;
  v_running timestamptz;
  v_receipt_expires timestamptz;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_catalog IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid item use';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:shop-use:' || p_key::text, 0)
  );

  SELECT receipt_row.user_id, receipt_row.catalog_id, receipt_row.expires_at
  INTO v_owner, v_catalog, expires_at
  FROM public.item_effect_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'item effect belongs to another user';
    END IF;

    -- The catalogue entry the receipt names, not the one the caller repeated,
    -- and through a local variable because `catalog_id` is an OUT parameter
    -- as well as a column of `user_items`.
    SELECT item_row.quantity INTO remaining_quantity
    FROM public.user_items AS item_row
    WHERE item_row.user_id = p_actor AND item_row.catalog_id = v_catalog;

    catalog_id := v_catalog;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  SELECT item_row.quantity, item_row.expires_at, catalog_row.effect_kind,
         catalog_row.effect_duration_days, catalog_row.holding_duration_days,
         catalog_row.maintenance_cost
  INTO v_quantity, v_item_expires, v_kind, v_effect_days, v_holding_days, v_upkeep
  FROM public.user_items AS item_row
  JOIN public.shop_catalog AS catalog_row ON catalog_row.id = item_row.catalog_id
  WHERE item_row.user_id = p_actor AND item_row.catalog_id = p_catalog
  FOR UPDATE OF item_row;

  IF v_quantity IS NULL OR v_quantity < 1 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'item is not owned';
  END IF;

  IF v_item_expires IS NOT NULL AND v_item_expires <= v_now THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'this item has expired';
  END IF;

  IF v_kind <> 'convenience' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'item cannot be consumed';
  END IF;

  IF v_holding_days IS NOT NULL OR v_upkeep > 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'a durable item is held, not consumed';
  END IF;

  SELECT max(receipt_row.expires_at) INTO v_running
  FROM public.item_effect_receipts AS receipt_row
  WHERE receipt_row.user_id = p_actor
    AND receipt_row.catalog_id = p_catalog
    AND receipt_row.expires_at > v_now;

  IF v_running IS NOT NULL THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'this effect is already running';
  END IF;

  UPDATE public.user_items AS item_row
  SET quantity = item_row.quantity - 1
  WHERE item_row.user_id = p_actor AND item_row.catalog_id = p_catalog
  RETURNING item_row.quantity INTO remaining_quantity;

  IF v_effect_days IS NULL THEN
    v_receipt_expires := NULL;
  ELSE
    v_receipt_expires := v_now + v_effect_days * interval '1 day';
  END IF;

  INSERT INTO public.item_effect_receipts (user_id, catalog_id, idempotency_key, expires_at)
  VALUES (p_actor, p_catalog, p_key, v_receipt_expires);

  catalog_id := p_catalog;
  expires_at := v_receipt_expires;
  replayed := false;
  RETURN NEXT;
END;
$$;

-- The weekly charge 17.4 prices every vehicle and lease in.
--
-- A job body the existing scheduler calls, in the shape 088 established: the
-- runner claims the Seoul week with `schedule_claim_run` and this does the
-- work, so there is no second scheduler and nothing here knows what time it
-- is beyond the week it is in.
--
-- IDEMPOTENT WITHOUT A KEY. Every other write in this schema carries the
-- caller's idempotency key, and a job has no caller to mint one. What stands
-- in for it is `shop_maintenance_receipts`'s UNIQUE (user_id, catalog_id,
-- maintenance_week): the loop selects only holdings with no receipt for this
-- week, so a second run in the same week finds nothing to do whether or not
-- the window claim was what stopped it.
--
-- ONE MEMBER'S BROKEN ACCOUNT IS NOT EVERY MEMBER'S WEEK. Each holding is
-- charged inside its own block, so an unexpected failure costs that one
-- holding and is counted, rather than rolling back the charges already made
-- for everybody ahead of it in the loop.
CREATE OR REPLACE FUNCTION public.shop_charge_weekly_upkeep()
RETURNS TABLE(
  charged_count integer,
  charged_amount bigint,
  unpaid_count integer,
  suspended_count integer,
  failed_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  -- The same boundary `schedule_period_key('weekly', ...)` names: Monday
  -- 04:30 in Asia/Seoul, so the receipt's week is the week the runner claimed.
  v_week date := pg_catalog.date_trunc(
    'week', (v_now AT TIME ZONE 'Asia/Seoul') - interval '4 hours 30 minutes')::date;
  v_grace integer := public.shop_upkeep_grace_weeks();
  v_row record;
  v_arrears bigint;
  v_weeks integer;
  v_first date;
  v_cap bigint;
  v_total bigint;
  v_cash uuid;
  v_sink uuid;
  v_balance bigint;
  v_transaction uuid;
  v_charged integer := 0;
  v_amount bigint := 0;
  v_unpaid integer := 0;
  v_suspended integer := 0;
  v_failed integer := 0;
BEGIN
  SELECT account_row.id INTO v_sink
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink'
    AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status;

  IF v_sink IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023',
      MESSAGE = 'the sink account is required to charge upkeep';
  END IF;

  FOR v_row IN
    SELECT item_row.user_id AS user_id,
           item_row.catalog_id AS catalog_id,
           catalog_row.maintenance_cost * item_row.quantity AS due
    FROM public.user_items AS item_row
    JOIN public.shop_catalog AS catalog_row ON catalog_row.id = item_row.catalog_id
    JOIN public.users AS user_row ON user_row.id = item_row.user_id
    WHERE item_row.quantity > 0
      AND catalog_row.maintenance_cost > 0
      AND user_row.status = 'active'::public.user_status
      AND (item_row.expires_at IS NULL OR item_row.expires_at > v_now)
      AND NOT EXISTS (
        SELECT 1 FROM public.shop_maintenance_receipts AS receipt_row
        WHERE receipt_row.user_id = item_row.user_id
          AND receipt_row.catalog_id = item_row.catalog_id
          AND receipt_row.maintenance_week = v_week
      )
    -- A stable order so two holdings of the same member are always locked the
    -- same way round, whatever else is running.
    ORDER BY item_row.user_id, item_row.catalog_id
  LOOP
    BEGIN
      SELECT arrears_row.amount_due, arrears_row.unpaid_weeks, arrears_row.first_missed_week
      INTO v_arrears, v_weeks, v_first
      FROM public.shop_upkeep_arrears AS arrears_row
      WHERE arrears_row.user_id = v_row.user_id
        AND arrears_row.catalog_id = v_row.catalog_id
      FOR UPDATE;

      v_arrears := coalesce(v_arrears, 0);
      v_weeks := coalesce(v_weeks, 0);

      -- 16.4's ceiling. Four weeks of this holding's own upkeep, cross-cut
      -- against the running total rather than against a week count, so a
      -- member who bought a second van does not get a cap sized for the first.
      v_cap := v_row.due * v_grace;
      v_total := least(v_arrears + v_row.due, v_cap);

      SELECT account_row.id, balance_row.available_amount
      INTO v_cash, v_balance
      FROM public.accounts AS account_row
      JOIN public.account_balances AS balance_row ON balance_row.account_id = account_row.id
      WHERE account_row.owner_user_id = v_row.user_id
        AND account_row.account_type = 'USER_CASH'::public.account_type
        AND account_row.status = 'active'::public.account_status
      FOR UPDATE OF account_row;

      -- Asked before the posting rather than caught after it. A member who
      -- cannot pay is an expected outcome of this job, and letting
      -- `economy_post_transaction` raise 22023 for it would make the ordinary
      -- case indistinguishable from a fault.
      IF v_cash IS NOT NULL AND v_balance >= v_total THEN
        v_transaction := public.economy_post_transaction(
          pg_catalog.gen_random_uuid(),
          'SHOP_MAINTENANCE',
          v_row.user_id,
          NULL,
          pg_catalog.jsonb_build_array(
            pg_catalog.jsonb_build_object(
              'accountId', v_cash, 'amount', v_total, 'direction', 'credit'),
            pg_catalog.jsonb_build_object(
              'accountId', v_sink, 'amount', v_total, 'direction', 'debit')
          ),
          'shop.maintenance.charged',
          pg_catalog.jsonb_build_object(
            'catalogId', v_row.catalog_id, 'week', v_week, 'arrears', v_arrears)
        );

        INSERT INTO public.shop_maintenance_receipts (
          idempotency_key, user_id, catalog_id, maintenance_week, amount, transaction_id
        ) VALUES (
          pg_catalog.gen_random_uuid(), v_row.user_id, v_row.catalog_id,
          v_week, v_total, v_transaction
        );

        DELETE FROM public.shop_upkeep_arrears AS arrears_row
        WHERE arrears_row.user_id = v_row.user_id
          AND arrears_row.catalog_id = v_row.catalog_id;

        v_charged := v_charged + 1;
        v_amount := v_amount + v_total;
      ELSE
        INSERT INTO public.shop_upkeep_arrears (
          user_id, catalog_id, unpaid_weeks, amount_due, suspended, first_missed_week
        ) VALUES (
          v_row.user_id, v_row.catalog_id, v_weeks + 1, v_total,
          v_weeks + 1 >= v_grace, coalesce(v_first, v_week)
        )
        ON CONFLICT (user_id, catalog_id) DO UPDATE
        SET unpaid_weeks = excluded.unpaid_weeks,
            amount_due = excluded.amount_due,
            suspended = excluded.suspended,
            updated_at = pg_catalog.clock_timestamp();

        v_unpaid := v_unpaid + 1;
        IF v_weeks + 1 >= v_grace THEN
          v_suspended := v_suspended + 1;
        END IF;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        v_failed := v_failed + 1;
    END;
  END LOOP;

  charged_count := v_charged;
  charged_amount := v_amount;
  unpaid_count := v_unpaid;
  suspended_count := v_suspended;
  failed_count := v_failed;
  RETURN NEXT;
END;
$$;

-- Paying off what a suspended holding owes, without waiting for Monday.
--
-- The idempotency template from 045, in order: validate, lock the KEY, look
-- for the receipt, refuse one that belongs to somebody else, then the work.
--
-- The receipt is dated to `first_missed_week` and not to today. That week is
-- by construction the one the weekly job could not write a receipt for, so
-- the UNIQUE (user_id, catalog_id, maintenance_week) has room for it; dating
-- it to the current week would collide with the receipt the job may already
-- have written for a member who fell behind and then caught up.
CREATE OR REPLACE FUNCTION public.shop_settle_upkeep(
  p_key uuid,
  p_actor uuid,
  p_catalog uuid
)
RETURNS TABLE(paid_amount bigint, ledger_transaction_id uuid, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_owner uuid;
  v_due bigint;
  v_week date;
  v_cash uuid;
  v_sink uuid;
  v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_catalog IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid upkeep settlement';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:shop-upkeep-settle:' || p_key::text, 0)
  );

  SELECT receipt_row.user_id, receipt_row.amount, receipt_row.transaction_id
  INTO v_owner, paid_amount, ledger_transaction_id
  FROM public.shop_maintenance_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'upkeep receipt belongs to another user';
    END IF;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  SELECT arrears_row.amount_due, arrears_row.first_missed_week
  INTO v_due, v_week
  FROM public.shop_upkeep_arrears AS arrears_row
  WHERE arrears_row.user_id = p_actor AND arrears_row.catalog_id = p_catalog
  FOR UPDATE;

  IF v_due IS NULL OR v_due <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'no upkeep is outstanding for this item';
  END IF;

  SELECT account_row.id INTO v_cash
  FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_sink
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'sink'
    AND account_row.account_type = 'SINK'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_sink IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active shop accounts required';
  END IF;

  -- Not pre-checked like the job's. This one has a caller who asked for it,
  -- so `economy_post_transaction`'s own 22023 is the right answer and reaches
  -- them as the conflict the screen already knows how to word.
  v_transaction := public.economy_post_transaction(
    p_key,
    'SHOP_MAINTENANCE',
    p_actor,
    NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_due, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_sink, 'amount', v_due, 'direction', 'debit')
    ),
    'shop.maintenance.settled',
    pg_catalog.jsonb_build_object('catalogId', p_catalog, 'week', v_week)
  );

  INSERT INTO public.shop_maintenance_receipts (
    idempotency_key, user_id, catalog_id, maintenance_week, amount, transaction_id
  ) VALUES (p_key, p_actor, p_catalog, v_week, v_due, v_transaction);

  DELETE FROM public.shop_upkeep_arrears AS arrears_row
  WHERE arrears_row.user_id = p_actor AND arrears_row.catalog_id = p_catalog;

  paid_amount := v_due;
  ledger_transaction_id := v_transaction;
  replayed := false;
  RETURN NEXT;
END;
$$;

-- One member's shelf, with the lifecycle on it.
--
-- Dropped and recreated rather than replaced: 075's version answers seven
-- columns and this answers fourteen, which `CREATE OR REPLACE` cannot do. The
-- seven it already had keep their names, order and types, so the only caller
-- that has to change is the one reading the new ones.
--
-- The expired holding is filtered here rather than swept away by a job, which
-- is the whole of expiry on the read side: a term that ended a second ago is
-- already gone from this answer.
DROP FUNCTION IF EXISTS public.shop_my_items(uuid);

CREATE FUNCTION public.shop_my_items(p_actor uuid)
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
         catalogue.maintenance_cost,
         (SELECT max(receipt.expires_at)
          FROM public.item_effect_receipts AS receipt
          WHERE receipt.user_id = held.user_id
            AND receipt.catalog_id = held.catalog_id
            AND receipt.expires_at > pg_catalog.clock_timestamp()),
         coalesce(owed.unpaid_weeks, 0),
         coalesce(owed.amount_due, 0),
         catalogue.maintenance_cost * public.shop_upkeep_grace_weeks(),
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

ALTER FUNCTION public.shop_use_item(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_charge_weekly_upkeep() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_settle_upkeep(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.shop_my_items(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.shop_use_item(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_charge_weekly_upkeep()
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_settle_upkeep(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.shop_my_items(uuid) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.shop_use_item(uuid, uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_settle_upkeep(uuid, uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.shop_my_items(uuid) TO moneyverse_app;
-- The runner calls this on the `app` connection, like every other job body in
-- 088 except reconciliation.
GRANT EXECUTE ON FUNCTION public.shop_charge_weekly_upkeep() TO moneyverse_app;

-- Restated, so this migration cannot later be misread as a relaxation. The
-- lifecycle added three new reasons to want a row out of these tables and not
-- one of them is a reason to hand the application role a SELECT.
REVOKE ALL PRIVILEGES ON TABLE public.shop_catalog, public.shop_inventory,
  public.shop_purchases, public.user_items, public.item_effect_receipts,
  public.shop_maintenance_receipts, public.shop_upkeep_arrears
  FROM PUBLIC, moneyverse_app;

COMMIT;
