-- ============================================================================
-- Migration 225: Fix admin_update_work_reward_policy Ambiguity
-- Resolves: column reference "effective_at" is ambiguous in scheduler auto-tune
-- ============================================================================

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
  INSERT INTO public.work_reward_policy_versions AS w (
    effective_at, daily_cap, weekly_cap, repeat_decay_percent, enabled, reason
  ) VALUES (
    pg_catalog.clock_timestamp(),
    v_daily_cap,
    v_weekly_cap,
    v_repeat_decay,
    v_enabled,
    v_reason
  )
  RETURNING w.id, w.effective_at, w.daily_cap, w.weekly_cap, w.repeat_decay_percent, w.enabled, w.reason;
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_update_work_reward_policy(uuid, bigint, bigint, smallint, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_work_reward_policy(uuid, bigint, bigint, smallint, boolean, text) TO moneyverse_app, moneyverse_migrator;
