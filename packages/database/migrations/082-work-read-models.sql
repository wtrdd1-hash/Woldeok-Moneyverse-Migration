BEGIN;

CREATE OR REPLACE FUNCTION public.work_my_dashboard(p_actor uuid)
RETURNS TABLE(daily_paid bigint, daily_cap bigint, weekly_paid bigint, weekly_cap bigint, active_assignments bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_day date := (clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date; v_week date := date_trunc('week', clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS(SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='active user required'; END IF;
  RETURN QUERY SELECT coalesce((SELECT paid_amount FROM public.work_reward_windows WHERE user_id=p_actor AND window_start=v_day AND window_kind='day'),0),p.daily_cap,coalesce((SELECT paid_amount FROM public.work_reward_windows WHERE user_id=p_actor AND window_start=v_week AND window_kind='week'),0),p.weekly_cap,(SELECT count(*) FROM public.work_assignments WHERE user_id=p_actor AND status IN ('assigned','submitted'))::bigint FROM public.work_reward_policy_versions p WHERE p.enabled AND p.effective_at<=clock_timestamp() ORDER BY p.effective_at DESC,p.id DESC LIMIT 1;
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
