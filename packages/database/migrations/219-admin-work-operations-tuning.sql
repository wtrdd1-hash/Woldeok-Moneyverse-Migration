-- Migration 219: Admin work task and reward policy tuning functions

CREATE OR REPLACE FUNCTION public.admin_update_work_task(
  p_actor uuid,
  p_task_id uuid,
  p_base_reward bigint DEFAULT NULL,
  p_base_experience bigint DEFAULT NULL,
  p_minimum_duration_seconds int DEFAULT NULL,
  p_daily_limit int DEFAULT NULL,
  p_active boolean DEFAULT NULL
)
RETURNS TABLE (
  task_id uuid,
  code text,
  name text,
  base_reward bigint,
  base_experience bigint,
  minimum_duration_seconds int,
  daily_limit int,
  active boolean,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'updating work tasks requires an administrator';
  END IF;

  RETURN QUERY
  UPDATE public.work_task_catalog AS t
  SET base_reward = COALESCE(p_base_reward, t.base_reward),
      base_experience = COALESCE(p_base_experience, t.base_experience),
      minimum_duration_seconds = COALESCE(p_minimum_duration_seconds, t.minimum_duration_seconds),
      daily_limit = COALESCE(p_daily_limit, t.daily_limit),
      active = COALESCE(p_active, t.active),
      updated_at = pg_catalog.clock_timestamp()
  WHERE t.id = p_task_id
  RETURNING t.id, t.code, t.name, t.base_reward, t.base_experience, t.minimum_duration_seconds, t.daily_limit, t.active, t.updated_at;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_update_work_task(uuid, uuid, bigint, bigint, int, int, boolean) FROM PUBLIC;
 GRANT EXECUTE ON FUNCTION public.admin_update_work_task(uuid, uuid, bigint, bigint, int, int, boolean) TO moneyverse_app, moneyverse_migrator;

CREATE OR REPLACE FUNCTION public.admin_update_work_reward_policy(
  p_actor uuid,
  p_daily_cap bigint DEFAULT NULL,
  p_weekly_cap bigint DEFAULT NULL,
  p_repeat_decay_percent smallint DEFAULT NULL,
  p_enabled boolean DEFAULT NULL,
  p_reason text DEFAULT NULL
)
RETURNS TABLE (
  policy_id int,
  effective_at timestamptz,
  daily_cap bigint,
  weekly_cap bigint,
  repeat_decay_percent smallint,
  enabled boolean,
  reason text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_current RECORD;
  v_daily_cap bigint;
  v_weekly_cap bigint;
  v_repeat_decay smallint;
  v_enabled boolean;
  v_reason text;
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE = '42501',
      MESSAGE = 'updating work reward policy requires an administrator';
  END IF;

  SELECT p.daily_cap, p.weekly_cap, p.repeat_decay_percent, p.enabled, p.reason
  INTO v_current
  FROM public.work_reward_policy_versions AS p
  ORDER BY p.id DESC
  LIMIT 1;

  v_daily_cap = COALESCE(p_daily_cap, v_current.daily_cap, 400);
  v_weekly_cap = COALESCE(p_weekly_cap, v_current.weekly_cap, 2200);
  v_repeat_decay = COALESCE(p_repeat_decay_percent, v_current.repeat_decay_percent, 20);
  v_enabled = COALESCE(p_enabled, v_current.enabled, true);
  v_reason = COALESCE(NULLIF(TRIM(p_reason), ''), 'Admin work policy update');

  RETURN QUERY
  INSERT INTO public.work_reward_policy_versions (
    effective_at, daily_cap, weekly_cap, repeat_decay_percent, enabled, reason
  ) VALUES (
    pg_catalog.clock_timestamp(),
    v_daily_cap,
    v_weekly_cap,
    v_repeat_decay,
    v_enabled,
    v_reason
  )
  RETURNING id, effective_at, daily_cap, weekly_cap, repeat_decay_percent, enabled, reason;
END;
$function$;

DEVOKE ALL ON FUNCTION public.admin_update_work_reward_policy(uuid, bigint, bigint, smallint, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_work_reward_policy(uuid, bigint, bigint, smallint, boolean, text) TO moneyverse_app, moneyverse_migrator;
