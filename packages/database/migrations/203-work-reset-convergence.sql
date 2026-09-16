BEGIN;

-- v2026.09.16.159
-- Converge every member-facing work quota read onto the same accelerated
-- Moneyverse day/week that the settlement functions already enforce.

CREATE OR REPLACE FUNCTION public.work_reward_preview(p_actor uuid, p_task uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  WITH now_value AS (
    SELECT pg_catalog.clock_timestamp() AS value
  ), policy AS (
    SELECT policy_row.daily_cap, policy_row.weekly_cap
    FROM public.work_reward_policy_versions AS policy_row
    CROSS JOIN now_value
    WHERE policy_row.enabled
      AND policy_row.effective_at <= now_value.value
    ORDER BY policy_row.effective_at DESC, policy_row.id DESC
    LIMIT 1
  ), standing AS (
    SELECT
      coalesce((
        SELECT sum(receipt_row.reward_amount)
        FROM public.work_reward_receipts AS receipt_row
        WHERE receipt_row.user_id = p_actor
          AND receipt_row.created_at >= public.server_game_day_start(now_value.value)
      ), 0)::bigint AS day_paid,
      coalesce((
        SELECT sum(receipt_row.reward_amount)
        FROM public.work_reward_receipts AS receipt_row
        WHERE receipt_row.user_id = p_actor
          AND receipt_row.created_at >= public.server_game_week_start(now_value.value)
      ), 0)::bigint AS week_paid,
      coalesce((
        SELECT count(*)
        FROM public.work_reward_receipts AS receipt_row
        JOIN public.work_assignments AS assignment_row
          ON assignment_row.id = receipt_row.assignment_id
        WHERE receipt_row.user_id = p_actor
          AND assignment_row.task_id = p_task
          AND receipt_row.created_at >= public.server_game_day_start(now_value.value)
      ), 0)::integer AS task_taken
    FROM now_value
  )
  SELECT CASE
    WHEN task_row.daily_limit > 0 AND standing.task_taken >= task_row.daily_limit THEN 0::bigint
    ELSE least(
      pg_catalog.round(
        task_row.base_reward *
        (1.0 + ((coalesce(progress_row.level, 1) - 1) * 0.05))
      )::bigint,
      greatest(policy.daily_cap - standing.day_paid, 0),
      greatest(policy.weekly_cap - standing.week_paid, 0)
    )
  END
  FROM public.work_task_catalog AS task_row
  CROSS JOIN policy
  CROSS JOIN standing
  LEFT JOIN public.user_job_progress AS progress_row
    ON progress_row.user_id = p_actor
   AND progress_row.job_type = task_row.job_type
  WHERE p_actor IS NOT NULL
    AND task_row.id = p_task
    AND task_row.active
    AND EXISTS (
      SELECT 1 FROM public.users AS user_row
      WHERE user_row.id = p_actor
        AND user_row.status = 'active'::public.user_status
    )
$$;

CREATE OR REPLACE FUNCTION public.work_my_dashboard_v2(p_actor uuid)
RETURNS TABLE(
  daily_paid bigint,
  daily_cap bigint,
  weekly_paid bigint,
  weekly_cap bigint,
  active_assignments bigint,
  game_day_key date,
  game_week_key date,
  day_ends_at timestamptz,
  week_ends_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_day date := public.server_game_day_key(v_now);
  v_week date := public.server_game_week_key(v_now);
  v_day_end timestamptz;
  v_week_end timestamptz;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor
      AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  SELECT clock.day_ends_at, clock.week_ends_at
    INTO v_day_end, v_week_end
  FROM public.server_game_clock(v_now) AS clock;

  RETURN QUERY
  SELECT
    coalesce((
      SELECT sum(receipt_row.reward_amount)
      FROM public.work_reward_receipts AS receipt_row
      WHERE receipt_row.user_id = p_actor
        AND receipt_row.created_at >= public.server_game_day_start(v_now)
    ), 0)::bigint,
    coalesce((
      SELECT policy_row.daily_cap
      FROM public.work_reward_policy_versions AS policy_row
      WHERE policy_row.enabled
        AND policy_row.effective_at <= v_now
      ORDER BY policy_row.effective_at DESC, policy_row.id DESC
      LIMIT 1
    ), 0),
    coalesce((
      SELECT sum(receipt_row.reward_amount)
      FROM public.work_reward_receipts AS receipt_row
      WHERE receipt_row.user_id = p_actor
        AND receipt_row.created_at >= public.server_game_week_start(v_now)
    ), 0)::bigint,
    coalesce((
      SELECT policy_row.weekly_cap
      FROM public.work_reward_policy_versions AS policy_row
      WHERE policy_row.enabled
        AND policy_row.effective_at <= v_now
      ORDER BY policy_row.effective_at DESC, policy_row.id DESC
      LIMIT 1
    ), 0),
    (
      SELECT count(*)
      FROM public.work_assignments AS assignment_row
      WHERE assignment_row.user_id = p_actor
        AND assignment_row.status IN ('assigned', 'submitted')
        AND (assignment_row.status <> 'assigned'
          OR assignment_row.expires_at > v_now)
    )::bigint,
    v_day,
    v_week,
    v_day_end,
    v_week_end;
END;
$$;

CREATE OR REPLACE FUNCTION public.work_my_dashboard(p_actor uuid)
RETURNS TABLE(
  daily_paid bigint,
  daily_cap bigint,
  weekly_paid bigint,
  weekly_cap bigint,
  active_assignments bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT dashboard.daily_paid, dashboard.daily_cap,
         dashboard.weekly_paid, dashboard.weekly_cap,
         dashboard.active_assignments
  FROM public.work_my_dashboard_v2(p_actor) AS dashboard
$$;

ALTER FUNCTION public.work_reward_preview(uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_my_dashboard_v2(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_my_dashboard(uuid) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.work_reward_preview(uuid, uuid),
  public.work_my_dashboard_v2(uuid), public.work_my_dashboard(uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_reward_preview(uuid, uuid),
  public.work_my_dashboard_v2(uuid), public.work_my_dashboard(uuid)
  TO moneyverse_app;

COMMIT;
