BEGIN;

-- v2026.09.15.129
-- Converge every member-facing "daily" boundary touched by the mobile/web game
-- onto migration 190's authoritative accelerated clock: 600 real seconds = 1
-- Moneyverse day. Applied migrations remain immutable; this forward migration
-- only replaces live function definitions.

DO $$
DECLARE
  v_reg regprocedure;
  v_definition text;
  v_updated text;
  v_old text;
  v_new text;
BEGIN
  -- Pure declaration/assignment substitutions keep each feature's existing
  -- ledger, locking, idempotency, payout and abuse controls unchanged.
  FOR v_reg, v_old, v_new IN
    SELECT * FROM (VALUES
      ('public.economy_claim_daily(uuid,uuid,date)'::regprocedure,
       'v_today date := (current_timestamp AT TIME ZONE ''Asia/Seoul'')::date;',
       'v_today date := public.server_game_day_key();'),
      ('public.economy_claim_daily(uuid,uuid,date)'::regprocedure,
       'daily reward is only available for the current Asia/Seoul date',
       'daily reward is only available for the current Moneyverse game day'),
      ('public.casino_coin_terms(uuid)'::regprocedure,
       'v_date date := (pg_catalog.now() AT TIME ZONE ''Asia/Seoul'')::date;',
       'v_date date := public.server_game_day_key();'),
      ('public.casino_play_coin(uuid,uuid,text,bigint)'::regprocedure,
       'v_date date := (pg_catalog.now() AT TIME ZONE ''Asia/Seoul'')::date;',
       'v_date date := public.server_game_day_key();'),
      ('public.casino_game_terms(uuid)'::regprocedure,
       'v_date date := (pg_catalog.now() AT TIME ZONE ''Asia/Seoul'')::date;',
       'v_date date := public.server_game_day_key();'),
      ('public.casino_play_dice(uuid,uuid,text,text,bigint)'::regprocedure,
       'v_date date := (pg_catalog.now() AT TIME ZONE ''Asia/Seoul'')::date;',
       'v_date date := public.server_game_day_key();'),
      ('public.early_event_today(uuid)'::regprocedure,
       'v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE ''Asia/Seoul'')::date;',
       'v_day date := public.server_game_day_key();'),
      ('public.early_event_claim(uuid,uuid,date)'::regprocedure,
       'v_today date := (pg_catalog.clock_timestamp() AT TIME ZONE ''Asia/Seoul'')::date;',
       'v_today date := public.server_game_day_key();'),
      ('public.early_event_claim(uuid,uuid,date)'::regprocedure,
       'the daily event is only claimable on its own Asia/Seoul date',
       'the daily event is only claimable on the current Moneyverse game day'),
      ('public.business_settle_daily(uuid,uuid,uuid)'::regprocedure,
       'v_date date := (pg_catalog.clock_timestamp() AT TIME ZONE ''Asia/Seoul'')::date;',
       'v_date date := public.server_game_day_key();'),
      ('public.business_settle_daily_v2(uuid,uuid,uuid)'::regprocedure,
       'v_date := (pg_catalog.now() AT TIME ZONE ''Asia/Seoul'')::date;',
       'v_date := public.server_game_day_key();')
    ) AS patches(regproc, old_text, new_text)
  LOOP
    SELECT pg_catalog.pg_get_functiondef(v_reg) INTO v_definition;
    v_updated := pg_catalog.replace(v_definition, v_old, v_new);
    IF v_updated = v_definition THEN
      RAISE EXCEPTION 'game-day patch did not match %', v_reg::text;
    END IF;
    EXECUTE v_updated;
  END LOOP;
END;
$$;

-- Restore the least-privilege boundaries that migrations 100 and 103 define.
-- Runtime QA found these grants widened in the current database; no application
-- request needs direct table access or these actor-unchecked/internal helpers.
REVOKE ALL PRIVILEGES ON FUNCTION public.early_event_draw(uuid, date)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.early_event_catalog, public.early_event_claims,
  public.early_first_day_steps, public.work_task_catalog, public.work_assignments,
  public.work_reward_receipts, public.user_job_progress, public.shop_catalog,
  public.shop_purchases, public.user_items, public.member_profiles
  FROM PUBLIC, moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.casino_roll_die() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_daily_usage(uuid, date) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_worst_case_loss(uuid, date) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_reject_payout_that_is_not_a_sink() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_reject_dice_trial_mutation() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_enforce_self_limit() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.casino_reject_activation_without_trial() FROM PUBLIC, moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.virtual_casino_coin_plays,
  public.virtual_casino_dice_plays, public.casino_policy, public.casino_game_payouts,
  public.casino_coin_distribution_trials, public.casino_dice_distribution_trials,
  public.casino_self_limits FROM PUBLIC, moneyverse_app;

-- Availability must expose the same boundary that the claim function enforces.
CREATE OR REPLACE FUNCTION public.wallet_reward_availability(p_actor uuid)
RETURNS TABLE(
  daily_available boolean,
  daily_next_eligible_at timestamptz,
  work_available boolean,
  work_next_eligible_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  WITH now_value AS (
    SELECT pg_catalog.clock_timestamp() AS value
  ), game_clock AS (
    SELECT clock.day_index, clock.day_ends_at,
           public.server_game_day_key(now_value.value) AS day_key
    FROM now_value
    CROSS JOIN LATERAL public.server_game_clock(now_value.value) AS clock
  ), daily_policy AS (
    SELECT policy_row.enabled FROM public.daily_reward_policy AS policy_row WHERE policy_row.singleton
  ), work_policy AS (
    SELECT policy_row.enabled, policy_row.cooldown FROM public.work_reward_policy AS policy_row WHERE policy_row.singleton
  ), last_work AS (
    SELECT max(reward_row.created_at) AS claimed_at FROM public.work_rewards AS reward_row WHERE reward_row.user_id = p_actor
  )
  SELECT
    coalesce(daily_policy.enabled, false) AND NOT EXISTS (
      SELECT 1 FROM public.daily_rewards AS reward_row
      WHERE reward_row.user_id = p_actor AND reward_row.reward_date = game_clock.day_key
    ),
    CASE WHEN coalesce(daily_policy.enabled, false) AND EXISTS (
      SELECT 1 FROM public.daily_rewards AS reward_row
      WHERE reward_row.user_id = p_actor AND reward_row.reward_date = game_clock.day_key
    ) THEN game_clock.day_ends_at ELSE NULL END,
    coalesce(work_policy.enabled, false) AND (last_work.claimed_at IS NULL OR last_work.claimed_at + work_policy.cooldown <= now_value.value),
    CASE WHEN coalesce(work_policy.enabled, false) AND last_work.claimed_at IS NOT NULL AND last_work.claimed_at + work_policy.cooldown > now_value.value
      THEN last_work.claimed_at + work_policy.cooldown ELSE NULL END
  FROM now_value
  CROSS JOIN game_clock
  LEFT JOIN daily_policy ON true
  LEFT JOIN work_policy ON true
  CROSS JOIN last_work
$$;
ALTER FUNCTION public.wallet_reward_availability(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.wallet_reward_availability(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.wallet_reward_availability(uuid) TO moneyverse_app;

COMMIT;
