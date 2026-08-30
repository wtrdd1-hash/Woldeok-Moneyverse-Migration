BEGIN;

CREATE OR REPLACE FUNCTION public.work_my_dashboard(p_actor uuid)
RETURNS TABLE(
  daily_paid bigint,
  daily_cap bigint,
  weekly_paid bigint,
  weekly_cap bigint,
  active_assignments bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_week date := date_trunc('week', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  -- No FROM clause, so this returns exactly one row whatever the subqueries
  -- find. Selecting from the policy table with a LIMIT returned no row at all
  -- when rewards were switched off, and the route answered 200 with an empty
  -- body -- which the page cannot tell apart from "you have earned nothing".
  RETURN QUERY
  SELECT
    coalesce((
      SELECT window_row.paid_amount FROM public.work_reward_windows AS window_row
      WHERE window_row.user_id = p_actor AND window_row.window_start = v_day
        AND window_row.window_kind = 'day'
    ), 0),
    coalesce((
      SELECT policy_row.daily_cap FROM public.work_reward_policy_versions AS policy_row
      WHERE policy_row.enabled AND policy_row.effective_at <= pg_catalog.clock_timestamp()
      ORDER BY policy_row.effective_at DESC, policy_row.id DESC LIMIT 1
    ), 0),
    coalesce((
      SELECT window_row.paid_amount FROM public.work_reward_windows AS window_row
      WHERE window_row.user_id = p_actor AND window_row.window_start = v_week
        AND window_row.window_kind = 'week'
    ), 0),
    coalesce((
      SELECT policy_row.weekly_cap FROM public.work_reward_policy_versions AS policy_row
      WHERE policy_row.enabled AND policy_row.effective_at <= pg_catalog.clock_timestamp()
      ORDER BY policy_row.effective_at DESC, policy_row.id DESC LIMIT 1
    ), 0),
    (
      -- An assignment past its expiry is not something the member can act on,
      -- so counting it as active tells them to finish work they cannot submit.
      SELECT count(*) FROM public.work_assignments AS assignment_row
      WHERE assignment_row.user_id = p_actor
        AND assignment_row.status IN ('assigned', 'submitted')
        AND (assignment_row.status <> 'assigned'
          OR assignment_row.expires_at > pg_catalog.clock_timestamp())
    )::bigint;
END;
$$;

CREATE OR REPLACE FUNCTION public.work_my_assignments(p_actor uuid)
RETURNS TABLE(assignment_id uuid, task_id uuid, code text, name text, job_type public.work_job_type, status public.work_assignment_status, assigned_at timestamptz, expires_at timestamptz, reward_amount bigint, experience_amount bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
  SELECT a.id,t.id,t.code,t.name,t.job_type,a.status,a.assigned_at,a.expires_at,r.reward_amount,r.experience_amount
  FROM public.work_assignments a JOIN public.work_task_catalog t ON t.id=a.task_id LEFT JOIN public.work_reward_receipts r ON r.assignment_id=a.id
  WHERE a.user_id=p_actor ORDER BY a.assigned_at DESC,a.id DESC LIMIT 50
$$;

ALTER FUNCTION public.work_my_dashboard(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_my_assignments(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_my_dashboard(uuid),public.work_my_assignments(uuid) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_my_dashboard(uuid),public.work_my_assignments(uuid) TO moneyverse_app;
COMMIT;
