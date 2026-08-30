-- What the engine would do, and why, without doing any of it.
--
-- The proposer is a read-only function on purpose. §15.4 requires the
-- reasoning behind every automatic change to be recorded, and the only way
-- to record reasoning that is actually the reasoning is to compute the
-- proposal separately from applying it, store what came back, and apply that
-- exact object. It also means an operator can ask "what would you do today"
-- on the test server without the engine being switched on anywhere.
--
-- HOW THE RULES COMBINE. §15.3 is a table of situations, and more than one
-- can be true in the same week -- prices are pushed up by a low burn ratio
-- and down by lines that are not selling. Contributions to the same knob are
-- summed and then clamped once, so opposing signals cancel rather than the
-- last rule in the list winning. A rule that fires and is then cancelled
-- still appears in the proposal's rule list, because "we saw both and they
-- balanced" is the answer to the question somebody will ask.
--
-- WHAT STOPS IT. A failed reconciliation does not need a check here: 088
-- already trips `economy_auto_policy` into safe mode when the ledger does
-- not balance, and this refuses to run unless that switch reads 'enabled'.
-- The window is checked for a failure anyway, because a superadmin can turn
-- the switch back on and the week's numbers do not become trustworthy when
-- they do.

BEGIN;

CREATE TABLE IF NOT EXISTS public.economy_auto_policy_settings (
  singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
  -- §15.4: a policy is held for at least seven days.
  minimum_days_between_changes integer NOT NULL DEFAULT 7
    CHECK (minimum_days_between_changes BETWEEN 1 AND 90),
  updated_by uuid REFERENCES public.users(id),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);
INSERT INTO public.economy_auto_policy_settings (singleton) VALUES (true)
ON CONFLICT (singleton) DO NOTHING;

REVOKE ALL PRIVILEGES ON TABLE public.economy_auto_policy_settings FROM PUBLIC, moneyverse_app;

-- A desired value turned into a permitted one: §15.3's per-change limit
-- first, then §15.4's absolute range. The step is measured against the
-- baseline rather than last week's value, so a knob sitting near its floor
-- can still climb at the same rate it fell.
CREATE OR REPLACE FUNCTION public.economy_clamp_knob(p_knob_key text, p_desired numeric)
RETURNS numeric
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_knob public.economy_policy_knobs%ROWTYPE;
  v_step numeric;
  v_value numeric;
BEGIN
  SELECT knob_row.* INTO v_knob
  FROM public.economy_policy_knobs AS knob_row
  WHERE knob_row.knob_key = p_knob_key;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'unknown policy knob';
  END IF;
  IF p_desired IS NULL THEN
    RETURN v_knob.current_value;
  END IF;

  v_step := CASE
    WHEN v_knob.max_step_percent IS NOT NULL AND v_knob.max_step_absolute IS NOT NULL
      THEN least(
        pg_catalog.abs(v_knob.baseline_value) * v_knob.max_step_percent / 100,
        v_knob.max_step_absolute)
    WHEN v_knob.max_step_percent IS NOT NULL
      THEN pg_catalog.abs(v_knob.baseline_value) * v_knob.max_step_percent / 100
    ELSE v_knob.max_step_absolute
  END;

  v_value := least(
    v_knob.current_value + v_step,
    greatest(v_knob.current_value - v_step, p_desired));

  -- Rounded to what the unit can express, then clamped again: rounding a
  -- value that was exactly on a bound can push it over.
  v_value := CASE v_knob.unit
    WHEN 'percent' THEN pg_catalog.round(v_value, 2)
    ELSE pg_catalog.round(v_value, 0)
  END;

  RETURN least(v_knob.max_value, greatest(v_knob.min_value, v_value));
END;
$$;

-- The week, as one object. This is what a policy stores in `source_metrics`
-- and what the console shows next to the proposal.
CREATE OR REPLACE FUNCTION public.economy_policy_window(p_days integer DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_days integer := least(greatest(coalesce(p_days, 7), 1), 30);
  v_latest public.economy_metric_snapshots%ROWTYPE;
  v_oldest public.economy_metric_snapshots%ROWTYPE;
  v_count integer;
  v_sufficient integer;
  v_below integer;
  v_above integer;
  v_burn_avg numeric;
  v_work_avg numeric;
  v_reconciliation_failures integer;
  v_job_concentration numeric;
  v_sold_out_share numeric;
  v_slow_share numeric;
BEGIN
  SELECT pg_catalog.count(*)::integer,
         pg_catalog.count(*) FILTER (WHERE window_row.sample_sufficient)::integer,
         pg_catalog.count(*) FILTER (WHERE window_row.burn_to_issue_percent < 50)::integer,
         pg_catalog.count(*) FILTER (WHERE window_row.burn_to_issue_percent > 100)::integer,
         pg_catalog.round(pg_catalog.avg(window_row.burn_to_issue_percent), 2),
         pg_catalog.round(pg_catalog.avg(window_row.work_issue_share_percent), 2)
  INTO v_count, v_sufficient, v_below, v_above, v_burn_avg, v_work_avg
  FROM public.economy_recent_metrics(v_days) AS window_row;

  IF v_count = 0 THEN
    RETURN pg_catalog.jsonb_build_object('days', 0, 'snapshotCount', 0);
  END IF;

  SELECT window_row.* INTO v_latest
  FROM public.economy_recent_metrics(v_days) AS window_row
  ORDER BY window_row.metric_date DESC LIMIT 1;

  SELECT window_row.* INTO v_oldest
  FROM public.economy_recent_metrics(v_days) AS window_row
  ORDER BY window_row.metric_date ASC LIMIT 1;

  SELECT pg_catalog.count(*)::integer INTO v_reconciliation_failures
  FROM public.economy_reconciliation_snapshots AS snapshot_row
  WHERE NOT snapshot_row.integrity_ok
    AND (snapshot_row.calculated_at AT TIME ZONE 'Asia/Seoul')::date
      BETWEEN v_oldest.metric_date AND v_latest.metric_date;

  -- The most-taken job's share of the week's assignments. §15.3 acts when
  -- one job is taking more than 60% of them.
  SELECT pg_catalog.round(100 * pg_catalog.max((entry ->> 'assignments')::numeric)
    / nullif(pg_catalog.sum((entry ->> 'assignments')::numeric), 0), 2)
  INTO v_job_concentration
  FROM pg_catalog.jsonb_array_elements(v_latest.job_selection) AS entry;

  -- A line counts as short if it was sold out on at least 80% of the days
  -- measured, and as slow if the week sold under a tenth of its reference
  -- supply. There is one supply dial and one price dial for the whole shop,
  -- so the engine responds to a shop-wide shortage rather than to a single
  -- line; a single line is 092's alert, for a person to price by hand.
  WITH lines AS (
    SELECT entry ->> 'code' AS code,
           pg_catalog.count(*) AS days_seen,
           pg_catalog.count(*) FILTER (WHERE (entry ->> 'soldOut')::boolean) AS days_out,
           pg_catalog.sum((entry ->> 'soldUnits')::numeric) AS sold_units,
           pg_catalog.max((entry ->> 'baselineQuantity')::numeric) AS baseline_quantity
    FROM public.economy_recent_metrics(v_days) AS window_row
    CROSS JOIN pg_catalog.jsonb_array_elements(window_row.item_demand) AS entry
    GROUP BY entry ->> 'code'
  )
  SELECT pg_catalog.round(100.0 * pg_catalog.count(*) FILTER (
           WHERE lines.days_out >= 0.8 * lines.days_seen)
           / nullif(pg_catalog.count(*), 0), 2),
         pg_catalog.round(100.0 * pg_catalog.count(*) FILTER (
           WHERE lines.baseline_quantity > 0
             AND lines.sold_units < 0.1 * lines.baseline_quantity)
           / nullif(pg_catalog.count(*), 0), 2)
  INTO v_sold_out_share, v_slow_share
  FROM lines;

  RETURN pg_catalog.jsonb_build_object(
    'days', v_days,
    'snapshotCount', v_count,
    'from', v_oldest.metric_date,
    'to', v_latest.metric_date,
    'sampleSufficientDays', v_sufficient,
    'reconciliationFailures', v_reconciliation_failures,
    'burnToIssuePercentAvg', v_burn_avg,
    'burnBelow50Days', v_below,
    'burnAbove100Days', v_above,
    'workIssueSharePercentAvg', v_work_avg,
    'newMemberMedianHoldings', v_latest.new_member_median_holdings,
    'newMemberCount', v_latest.new_member_count,
    'topDecileSharePercent', v_latest.top_decile_share_percent,
    'bankSharePercent', v_latest.bank_share_percent,
    'firstBusinessDaysMedian', v_latest.first_business_days_median,
    'activeMemberCount', v_latest.active_member_count,
    'tradingRatePercent', CASE WHEN v_latest.active_member_count > 0
      THEN pg_catalog.round(100.0 * v_latest.trading_member_count
        / v_latest.active_member_count, 2) END,
    'shopConversionPercent', CASE WHEN v_latest.active_member_count > 0
      THEN pg_catalog.round(100.0 * v_latest.purchasing_member_count
        / v_latest.active_member_count, 2) END,
    'm2ChangePercent', CASE WHEN v_oldest.m2_amount > 0
      THEN pg_catalog.round(100 * (v_latest.m2_amount - v_oldest.m2_amount)
        / v_oldest.m2_amount, 2) END,
    'jobConcentrationPercent', v_job_concentration,
    'soldOutLineSharePercent', v_sold_out_share,
    'slowLineSharePercent', v_slow_share
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.economy_propose_policy_adjustment(p_days integer DEFAULT 7)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_window jsonb := public.economy_policy_window(p_days);
  -- The literals appended to this below carry an explicit ::text. Without
  -- one, `text[] || 'a string'` resolves to array || array and the string is
  -- parsed as an array literal -- 22P02, at run time, on the refusal path.
  v_blocked text[] := ARRAY[]::text[];
  v_rules jsonb[] := ARRAY[]::jsonb[];
  v_adjustments jsonb;
  v_observations text[] := ARRAY[]::text[];
  v_days integer := coalesce((v_window ->> 'days')::integer, 0);
  v_state text := public.feature_switch_state('economy_auto_policy');
  v_minimum integer;
  v_last timestamptz;
  v_number numeric;
BEGIN
  IF v_state <> 'enabled' THEN
    v_blocked := v_blocked || ('the economy_auto_policy switch reads ' || v_state);
  END IF;

  IF v_days = 0 OR coalesce((v_window ->> 'snapshotCount')::integer, 0) < v_days THEN
    v_blocked := v_blocked
      || 'the window is missing daily metrics; the engine reads a whole week or nothing'::text;
  ELSIF (v_window ->> 'sampleSufficientDays')::integer < v_days THEN
    v_blocked := v_blocked || 'at least one day had too few active members to read'::text;
  END IF;

  IF coalesce((v_window ->> 'reconciliationFailures')::integer, 0) > 0 THEN
    v_blocked := v_blocked || 'the ledger failed to reconcile inside the window'::text;
  END IF;

  SELECT settings_row.minimum_days_between_changes INTO v_minimum
  FROM public.economy_auto_policy_settings AS settings_row WHERE settings_row.singleton;

  SELECT pg_catalog.max(coalesce(policy_row.activated_at, policy_row.created_at))
  INTO v_last
  FROM public.economy_policies AS policy_row
  WHERE policy_row.origin = 'automatic';

  IF v_last IS NOT NULL
    AND v_last > pg_catalog.clock_timestamp() - pg_catalog.make_interval(days => v_minimum) THEN
    v_blocked := v_blocked || pg_catalog.format(
      'the last automatic policy is younger than %s days', v_minimum);
  END IF;

  -- §15.3, in the order it is written there.
  IF (v_window ->> 'burnBelow50Days')::integer >= v_days AND v_days > 0 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'shop.essential_price_percent', 'kind', 'percent', 'delta', 5, 'rule', 'burn_below_50')
      || pg_catalog.jsonb_build_object('knob', 'shop.general_price_percent', 'kind', 'percent', 'delta', 5, 'rule', 'burn_below_50')
      || pg_catalog.jsonb_build_object('knob', 'shop.maintenance_percent', 'kind', 'percent', 'delta', 5, 'rule', 'burn_below_50')
      || pg_catalog.jsonb_build_object('knob', 'business.operating_cost_percent', 'kind', 'percent', 'delta', 5, 'rule', 'burn_below_50');
  END IF;

  IF (v_window ->> 'burnAbove100Days')::integer >= v_days AND v_days > 0 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'work.daily_cap', 'kind', 'percent', 'delta', 5, 'rule', 'burn_above_100')
      || pg_catalog.jsonb_build_object('knob', 'work.weekly_cap', 'kind', 'percent', 'delta', 5, 'rule', 'burn_above_100')
      || pg_catalog.jsonb_build_object('knob', 'shop.supply_percent', 'kind', 'percent', 'delta', 5, 'rule', 'burn_above_100');
  END IF;

  v_number := (v_window ->> 'newMemberMedianHoldings')::numeric;
  IF v_number IS NOT NULL AND v_number < 4000 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'work.daily_cap', 'kind', 'percent', 'delta', 8, 'rule', 'new_member_holdings_low')
      || pg_catalog.jsonb_build_object('knob', 'work.weekly_cap', 'kind', 'percent', 'delta', 8, 'rule', 'new_member_holdings_low');
  ELSIF v_number IS NOT NULL AND v_number > 6000 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'work.daily_cap', 'kind', 'percent', 'delta', -5, 'rule', 'new_member_holdings_high')
      || pg_catalog.jsonb_build_object('knob', 'work.weekly_cap', 'kind', 'percent', 'delta', -5, 'rule', 'new_member_holdings_high');
  END IF;

  v_number := (v_window ->> 'firstBusinessDaysMedian')::numeric;
  IF v_number IS NOT NULL AND v_number > 14 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'business.purchase_cost_percent', 'kind', 'percent', 'delta', -5, 'rule', 'first_business_slow');
  END IF;

  v_number := (v_window ->> 'jobConcentrationPercent')::numeric;
  IF v_number IS NOT NULL AND v_number > 60 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'work.repeat_decay_percent', 'kind', 'absolute', 'delta', 5, 'rule', 'one_job_dominates');
  END IF;

  v_number := (v_window ->> 'soldOutLineSharePercent')::numeric;
  IF v_number IS NOT NULL AND v_number > 33 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'shop.supply_percent', 'kind', 'percent', 'delta', 10, 'rule', 'shop_short');
  END IF;

  v_number := (v_window ->> 'slowLineSharePercent')::numeric;
  IF v_number IS NOT NULL AND v_number > 50 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'shop.general_price_percent', 'kind', 'percent', 'delta', -5, 'rule', 'shop_slow');
  END IF;

  v_number := (v_window ->> 'bankSharePercent')::numeric;
  IF v_number IS NOT NULL AND v_number > 60 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'bank.deposit_rate_delta_bps', 'kind', 'absolute', 'delta', -1, 'rule', 'money_parked');
  END IF;

  v_number := (v_window ->> 'm2ChangePercent')::numeric;
  IF v_number IS NOT NULL AND v_number < -15 THEN
    v_rules := v_rules
      || pg_catalog.jsonb_build_object('knob', 'bank.deposit_rate_delta_bps', 'kind', 'absolute', 'delta', 1, 'rule', 'circulation_fell');
  END IF;

  -- §15.1 watches these two and §15.3 gives them no lever, so they are said
  -- rather than acted on.
  v_number := (v_window ->> 'topDecileSharePercent')::numeric;
  IF v_number IS NOT NULL AND v_number > 55 THEN
    v_observations := v_observations || pg_catalog.format(
      'the top tenth holds %s%% of member money, above the 55%% target', v_number);
  END IF;
  v_number := (v_window ->> 'workIssueSharePercentAvg')::numeric;
  IF v_number IS NOT NULL AND v_number > 50 THEN
    v_observations := v_observations || pg_catalog.format(
      'work is %s%% of new issuance, above the 50%% target', v_number);
  END IF;

  SELECT pg_catalog.jsonb_agg(proposals.adjustment ORDER BY proposals.knob_key)
  INTO v_adjustments
  FROM (
    SELECT knob_row.knob_key,
           pg_catalog.jsonb_build_object(
             'knob', knob_row.knob_key,
             'title', knob_row.title,
             'unit', knob_row.unit,
             'from', knob_row.current_value,
             'to', public.economy_clamp_knob(
               knob_row.knob_key,
               knob_row.current_value * (1 + coalesce(contributions.percent_delta, 0) / 100)
                 + coalesce(contributions.absolute_delta, 0)),
             'rules', contributions.rules
           ) AS adjustment
    FROM (
      SELECT entry ->> 'knob' AS knob_key,
             pg_catalog.sum((entry ->> 'delta')::numeric)
               FILTER (WHERE entry ->> 'kind' = 'percent') AS percent_delta,
             pg_catalog.sum((entry ->> 'delta')::numeric)
               FILTER (WHERE entry ->> 'kind' = 'absolute') AS absolute_delta,
             pg_catalog.jsonb_agg(DISTINCT entry ->> 'rule') AS rules
      FROM pg_catalog.unnest(v_rules) AS entry
      GROUP BY entry ->> 'knob'
    ) AS contributions
    JOIN public.economy_policy_knobs AS knob_row
      ON knob_row.knob_key = contributions.knob_key
    WHERE knob_row.auto_adjustable
  ) AS proposals
  WHERE (proposals.adjustment ->> 'to')::numeric
    IS DISTINCT FROM (proposals.adjustment ->> 'from')::numeric;

  RETURN pg_catalog.jsonb_build_object(
    'eligible', pg_catalog.array_length(v_blocked, 1) IS NULL
      AND v_adjustments IS NOT NULL,
    'blockedBy', pg_catalog.to_jsonb(v_blocked),
    'sourceMetrics', v_window,
    'adjustments', coalesce(v_adjustments, '[]'::jsonb),
    'observations', pg_catalog.to_jsonb(v_observations)
  );
END;
$$;

ALTER FUNCTION public.economy_clamp_knob(text, numeric) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_policy_window(integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.economy_propose_policy_adjustment(integer) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.economy_clamp_knob(text, numeric) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_policy_window(integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.economy_propose_policy_adjustment(integer) FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.economy_policy_window(integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_propose_policy_adjustment(integer) TO moneyverse_app;

COMMIT;
