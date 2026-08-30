-- The numbers the automatic engine is allowed to move, and the baselines it
-- moves them from.
--
-- §15 asks for an engine that "creates the next policy version rather than
-- editing the ledger". `economy_policies` has carried version, effective_at,
-- status and payload since init/001 and 059 gave it the three verbs, so the
-- record already exists. What was missing is the other end: a policy payload
-- nothing reads changes nothing. The game reads its numbers from
-- `work_reward_policy_versions`, `shop_catalog`, `shop_inventory` and
-- `virtual_business_types`, and an engine that adjusts a parallel table of
-- its own would compute, audit and alert without a single member noticing.
--
-- So the knob registry names each adjustable number, the live column it
-- lands in, and the bounds §15.4 puts around it. A knob that is not in this
-- table cannot be adjusted, which is how §15.4's two exclusions are
-- expressed: there is no casino knob and no loan knob, so neither can be
-- reached by any amount of arithmetic. Loan terms are read at issue time from
-- `bank_credit_policies`, so an existing contract keeps the rate it was
-- written with either way.
--
-- BASELINES. Percentage knobs need something to be a percentage OF. Without
-- a stored baseline, "+5%" applied weekly compounds -- eleven quiet weeks of
-- +5% is +70%, which is outside every bound in §15.4 while never once
-- breaking one. The baseline columns below are each item's price, upkeep and
-- supply as they stood before the engine existed; the applier always
-- computes from the baseline, never from last week's result. It also means a
-- rollback restores a number rather than approximating it.
--
-- TWO OF §15.3'S KNOBS DO NOT EXIST. There is no transaction fee and no
-- consumption tax anywhere in this schema -- not switched off, not zero:
-- absent. Adding them would be a change to what the game charges people,
-- which is a design decision and not something an adjustment engine should
-- introduce as a side effect of being built. They are left out, and the two
-- §15.3 rules that name them are implemented through the knobs that do
-- exist (shop prices and business upkeep move on the same signal).

BEGIN;

-- §15.4 asks every policy to carry its reasoning. `payload` could hold it,
-- but a jsonb blob nobody indexes is not a record anybody can query, and
-- "which versions did the engine write" is the first question an operator
-- asks after a bad week.
ALTER TABLE public.economy_policies
  ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_metrics jsonb,
  ADD COLUMN IF NOT EXISTS previous_values jsonb,
  ADD COLUMN IF NOT EXISTS new_values jsonb,
  ADD COLUMN IF NOT EXISTS rollback_version text;

ALTER TABLE public.economy_policies DROP CONSTRAINT IF EXISTS economy_policies_origin_check;
ALTER TABLE public.economy_policies
  ADD CONSTRAINT economy_policies_origin_check CHECK (origin IN ('manual', 'automatic'));

CREATE INDEX IF NOT EXISTS economy_policies_automatic_recent
  ON public.economy_policies (activated_at DESC)
  WHERE origin = 'automatic';

CREATE TABLE IF NOT EXISTS public.economy_policy_knobs (
  knob_key text PRIMARY KEY CHECK (knob_key ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$'),
  title text NOT NULL CHECK (pg_catalog.char_length(title) BETWEEN 1 AND 100),
  -- 'amount' is a WLD figure written straight into its column, 'percent' is
  -- a proportion of the stored baseline, 'bps' is a rate in basis points.
  unit text NOT NULL CHECK (unit IN ('amount', 'percent', 'bps')),
  current_value numeric NOT NULL,
  baseline_value numeric NOT NULL,
  -- §15.4's ranges. The engine may not leave these and neither may a
  -- superadmin raising the approved range, because they are a CHECK.
  min_value numeric NOT NULL,
  max_value numeric NOT NULL,
  -- §15.3's per-change limits. Both may apply; the tighter one wins. A rate
  -- of 3 bps has no useful percentage step -- §15.3 says one basis point --
  -- and a price has no useful absolute one.
  max_step_percent numeric CHECK (max_step_percent IS NULL OR (max_step_percent > 0 AND max_step_percent <= 25)),
  max_step_absolute numeric CHECK (max_step_absolute IS NULL OR max_step_absolute > 0),
  auto_adjustable boolean NOT NULL DEFAULT true,
  -- Why a superadmin took this knob off automatic. §15.4 asks for per-item
  -- suspension and a reason is the difference between that and an outage.
  paused_reason text NOT NULL DEFAULT '',
  updated_by uuid REFERENCES public.users(id),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  CONSTRAINT economy_policy_knobs_range CHECK (min_value <= max_value),
  CONSTRAINT economy_policy_knobs_current_in_range
    CHECK (current_value >= min_value AND current_value <= max_value),
  CONSTRAINT economy_policy_knobs_baseline_in_range
    CHECK (baseline_value >= min_value AND baseline_value <= max_value),
  CONSTRAINT economy_policy_knobs_has_a_step
    CHECK (max_step_percent IS NOT NULL OR max_step_absolute IS NOT NULL)
);

REVOKE ALL PRIVILEGES ON TABLE public.economy_policy_knobs FROM PUBLIC, moneyverse_app;

-- ON CONFLICT DO NOTHING for 059's reason: re-running a migration must not
-- undo a bound an operator widened or a knob they paused.
INSERT INTO public.economy_policy_knobs (
  knob_key, title, unit, current_value, baseline_value, min_value, max_value,
  max_step_percent, max_step_absolute
) VALUES
  -- §15.4: work rewards stay within 80-120% of their baseline. §15.3 allows
  -- +8% in one change when new members are below the holdings floor, and -5%
  -- when they are above the ceiling; the larger of the two is the limit here
  -- and the direction-specific figure is applied by the proposer.
  ('work.daily_cap', '작업 일일 보상 한도', 'amount', 400, 400, 320, 480, 8, NULL),
  ('work.weekly_cap', '작업 주간 보상 한도', 'amount', 2200, 2200, 1760, 2640, 8, NULL),
  -- Raising the decay is what §15.3 asks for when one job takes over. The
  -- range is the column's own CHECK narrowed to something a member can still
  -- earn under.
  ('work.repeat_decay_percent', '작업 반복 감쇠율', 'percent', 20, 20, 10, 40, NULL, 5),
  -- §15.4: early essentials 80-120% of the reference price, general goods
  -- 70-150%. 'general' and 'job' are the categories a member buys in their
  -- first fortnight; the rest are vehicles, leases, season and luxury items,
  -- which nobody needs to progress.
  ('shop.essential_price_percent', '필수품 가격 배율', 'percent', 100, 100, 80, 120, 5, NULL),
  ('shop.general_price_percent', '일반품 가격 배율', 'percent', 100, 100, 70, 150, 5, NULL),
  -- Upkeep is a sink rather than a price, so §15.4's price band does not
  -- apply to it; it moves on the same signal and within the tighter band.
  ('shop.maintenance_percent', '보유 품목 유지비 배율', 'percent', 100, 100, 80, 120, 5, NULL),
  ('business.operating_cost_percent', '사업 운영비 배율', 'percent', 100, 100, 80, 120, 5, NULL),
  -- §15.3 lowers the entry price when members are taking too long to reach
  -- their first business. It only ever moves what a business costs to buy
  -- from now on; an ownership already bought is a settled transaction.
  ('business.purchase_cost_percent', '사업 인수가 배율', 'percent', 100, 100, 80, 120, 5, NULL),
  -- §15.3: a line that sells out 80% of the time gets up to +10% supply next
  -- week. Halving is the floor because zero would read as "withdrawn".
  ('shop.supply_percent', '상점 공급량 배율', 'percent', 100, 100, 50, 200, 10, NULL),
  -- §15.3 moves the deposit rate by one basis point at a time. It is a delta
  -- rather than a rate because 041 already varies the rate with circulation,
  -- and replacing that with a flat number would trade a response for a knob.
  -- The accrual CHECKs its rate into 1-10, so the sum is clamped there too.
  ('bank.deposit_rate_delta_bps', '예금 이율 가감 (bp)', 'bps', 0, 0, -2, 2, NULL, 1)
ON CONFLICT (knob_key) DO NOTHING;

-- The reference prices. Captured now, before the engine has ever run, so
-- they are the numbers a designer chose rather than a number the engine
-- arrived at.
ALTER TABLE public.shop_catalog
  ADD COLUMN IF NOT EXISTS baseline_price bigint,
  ADD COLUMN IF NOT EXISTS baseline_maintenance_cost bigint;
UPDATE public.shop_catalog
SET baseline_price = coalesce(baseline_price, base_price),
    baseline_maintenance_cost = coalesce(baseline_maintenance_cost, maintenance_cost);

ALTER TABLE public.shop_inventory
  ADD COLUMN IF NOT EXISTS baseline_quantity integer;
UPDATE public.shop_inventory SET baseline_quantity = coalesce(baseline_quantity, quantity);

ALTER TABLE public.virtual_business_types
  ADD COLUMN IF NOT EXISTS baseline_operating_cost bigint,
  ADD COLUMN IF NOT EXISTS baseline_purchase_cost bigint;
UPDATE public.virtual_business_types
SET baseline_operating_cost = coalesce(baseline_operating_cost, daily_operating_cost),
    baseline_purchase_cost = coalesce(baseline_purchase_cost, purchase_cost);

-- A row added later gets its baseline from its own opening value, so nobody
-- has to remember to write one and the engine never sees a NULL.
CREATE OR REPLACE FUNCTION public.economy_capture_baselines()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF TG_TABLE_NAME = 'shop_catalog' THEN
    NEW.baseline_price := coalesce(NEW.baseline_price, NEW.base_price);
    NEW.baseline_maintenance_cost :=
      coalesce(NEW.baseline_maintenance_cost, NEW.maintenance_cost);
  ELSIF TG_TABLE_NAME = 'shop_inventory' THEN
    NEW.baseline_quantity := coalesce(NEW.baseline_quantity, NEW.quantity);
  ELSE
    NEW.baseline_operating_cost :=
      coalesce(NEW.baseline_operating_cost, NEW.daily_operating_cost);
    NEW.baseline_purchase_cost :=
      coalesce(NEW.baseline_purchase_cost, NEW.purchase_cost);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS shop_catalog_capture_baseline ON public.shop_catalog;
CREATE TRIGGER shop_catalog_capture_baseline
  BEFORE INSERT ON public.shop_catalog
  FOR EACH ROW EXECUTE FUNCTION public.economy_capture_baselines();

DROP TRIGGER IF EXISTS shop_inventory_capture_baseline ON public.shop_inventory;
CREATE TRIGGER shop_inventory_capture_baseline
  BEFORE INSERT ON public.shop_inventory
  FOR EACH ROW EXECUTE FUNCTION public.economy_capture_baselines();

DROP TRIGGER IF EXISTS virtual_business_types_capture_baseline ON public.virtual_business_types;
CREATE TRIGGER virtual_business_types_capture_baseline
  BEFORE INSERT ON public.virtual_business_types
  FOR EACH ROW EXECUTE FUNCTION public.economy_capture_baselines();

-- Every knob's value as one object, which is what a policy row stores in
-- `previous_values` and `new_values` and what the applier compares against.
CREATE OR REPLACE FUNCTION public.economy_policy_values()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT coalesce(
    pg_catalog.jsonb_object_agg(knob_row.knob_key, knob_row.current_value),
    '{}'::jsonb
  )
  FROM public.economy_policy_knobs AS knob_row
$$;

-- 041's rate, plus whatever the engine has decided. Clamped into the range
-- the accrual's own CHECK accepts, because a delta that pushed it to 0 would
-- turn a rate change into a nightly exception in a scheduled job.
CREATE OR REPLACE FUNCTION public.bank_auto_interest_rate_bps()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT least(10, greatest(1,
    (SELECT CASE
       WHEN coalesce(pg_catalog.sum(balance.available_amount), 0) < 10000000 THEN 4
       WHEN coalesce(pg_catalog.sum(balance.available_amount), 0) < 100000000 THEN 3
       ELSE 2
     END
     FROM public.account_balances AS balance
     JOIN public.accounts AS account ON account.id = balance.account_id
     WHERE account.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
       AND account.status = 'active'::public.account_status)
    + coalesce((SELECT knob_row.current_value FROM public.economy_policy_knobs AS knob_row
                WHERE knob_row.knob_key = 'bank.deposit_rate_delta_bps'), 0)
  ))::integer
$$;

ALTER FUNCTION public.economy_capture_baselines() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_policy_values() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bank_auto_interest_rate_bps() OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.economy_policy_values() FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_policy_values() TO moneyverse_app;

COMMIT;
