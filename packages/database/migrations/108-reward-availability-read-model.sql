BEGIN;

-- The claim functions remain the authority for issuing a reward. This read
-- model only exposes the member's own next eligible moment so a reload does
-- not offer a reward that the database will immediately reject.
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
      WHERE reward_row.user_id = p_actor AND reward_row.reward_date = (now_value.value AT TIME ZONE 'Asia/Seoul')::date
    ),
    CASE WHEN coalesce(daily_policy.enabled, false) AND EXISTS (
      SELECT 1 FROM public.daily_rewards AS reward_row
      WHERE reward_row.user_id = p_actor AND reward_row.reward_date = (now_value.value AT TIME ZONE 'Asia/Seoul')::date
    ) THEN (((now_value.value AT TIME ZONE 'Asia/Seoul')::date + 1)::timestamp AT TIME ZONE 'Asia/Seoul') ELSE NULL END,
    coalesce(work_policy.enabled, false) AND (last_work.claimed_at IS NULL OR last_work.claimed_at + work_policy.cooldown <= now_value.value),
    CASE WHEN coalesce(work_policy.enabled, false) AND last_work.claimed_at IS NOT NULL AND last_work.claimed_at + work_policy.cooldown > now_value.value
      THEN last_work.claimed_at + work_policy.cooldown ELSE NULL END
  FROM now_value LEFT JOIN daily_policy ON true LEFT JOIN work_policy ON true CROSS JOIN last_work
$$;

ALTER FUNCTION public.wallet_reward_availability(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.wallet_reward_availability(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.wallet_reward_availability(uuid) TO moneyverse_app;

COMMIT;
