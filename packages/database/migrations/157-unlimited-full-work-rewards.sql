-- The global work caps were removed in migration 130. Remove the remaining
-- per-task overtime reduction introduced later by migration 133.
BEGIN;

DO $$
DECLARE
  v_definition text;
  v_updated text;
BEGIN
  SELECT pg_catalog.pg_get_functiondef('public.work_complete_task_v2(uuid,uuid,uuid)'::regprocedure)
  INTO v_definition;

  v_updated := pg_catalog.replace(
    v_definition,
    'v_is_overtime := (v_today_completions >= v_task.daily_limit);',
    'v_is_overtime := false;'
  );
  v_updated := pg_catalog.replace(
    v_updated,
    'v_reward := LEAST(
    v_base_reward,
    GREATEST(v_daily_cap - coalesce(v_day_paid, 0), 0),
    GREATEST(v_weekly_cap - coalesce(v_week_paid, 0), 0)
  );',
    'v_reward := v_base_reward;'
  );

  IF v_updated = v_definition
     OR position('v_is_overtime := false;' IN v_updated) = 0
     OR position('v_reward := v_base_reward;' IN v_updated) = 0 THEN
    RAISE EXCEPTION 'work_complete_task_v2 definition did not match the expected migration 133 body';
  END IF;
  EXECUTE v_updated;
END;
$$;

-- Preview and direct completion both pay the full task amount on every repeat.
CREATE OR REPLACE FUNCTION public.work_reward_preview(p_actor uuid, p_task uuid)
RETURNS bigint
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $$
  SELECT task_row.base_reward
  FROM public.work_task_catalog AS task_row
  WHERE p_actor IS NOT NULL AND task_row.id = p_task AND task_row.active
$$;

ALTER FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_reward_preview(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid), public.work_reward_preview(uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid), public.work_reward_preview(uuid, uuid)
  TO moneyverse_app;

COMMIT;
