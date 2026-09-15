-- Restore administrator work caps as the authoritative runtime quota.
BEGIN;

-- Migration 130 inserted an unlimited policy without moving the admin knobs.
-- Reconcile once so the currently configured administrator values immediately
-- become the newest policy version used by every work execution path.
INSERT INTO public.work_reward_policy_versions (
  daily_cap, weekly_cap, repeat_decay_percent, enabled, reason
)
SELECT
  daily.current_value::bigint,
  weekly.current_value::bigint,
  decay.current_value::smallint,
  coalesce((SELECT p.enabled FROM public.work_reward_policy_versions p
            ORDER BY p.effective_at DESC, p.id DESC LIMIT 1), true),
  'v194 restore administrator work quota authority'
FROM public.economy_policy_knobs daily
JOIN public.economy_policy_knobs weekly ON weekly.knob_key = 'work.weekly_cap'
JOIN public.economy_policy_knobs decay ON decay.knob_key = 'work.repeat_decay_percent'
WHERE daily.knob_key = 'work.daily_cap'
  AND NOT EXISTS (
    SELECT 1 FROM (
      SELECT p.daily_cap, p.weekly_cap, p.repeat_decay_percent
      FROM public.work_reward_policy_versions p
      ORDER BY p.effective_at DESC, p.id DESC LIMIT 1
    ) latest
    WHERE latest.daily_cap = daily.current_value
      AND latest.weekly_cap = weekly.current_value
      AND latest.repeat_decay_percent = decay.current_value
  );

DO $$
DECLARE
  v_definition text;
  v_updated text;
BEGIN
  SELECT pg_catalog.pg_get_functiondef('public.work_complete_task_v2(uuid,uuid,uuid)'::regprocedure)
    INTO v_definition;

  IF position('moneyverse:work-global-quota:' IN v_definition) = 0 THEN
    v_updated := pg_catalog.replace(
      v_definition,
      '  -- 3. 일간 및 주간 윈도우 레코드 생성 및 잠금',
      E'  -- Serialize the member-wide budget across every task and client.\n  PERFORM pg_catalog.pg_advisory_xact_lock(\n    pg_catalog.hashtextextended(''moneyverse:work-global-quota:'' || p_actor::text, 0)\n  );\n\n  -- 3. 일간 및 주간 윈도우 레코드 생성 및 잠금'
    );
    v_updated := pg_catalog.replace(
      v_updated,
      '  v_reward := v_base_reward;',
      E'  v_reward := LEAST(\n    v_base_reward,\n    GREATEST(v_daily_cap - coalesce(v_day_paid, 0), 0),\n    GREATEST(v_weekly_cap - coalesce(v_week_paid, 0), 0)\n  );\n  IF v_reward <= 0 THEN\n    RAISE EXCEPTION USING ERRCODE = ''22023'', MESSAGE = ''work reward quota reached'';\n  END IF;'
    );
    IF v_updated = v_definition
       OR position('work reward quota reached' IN v_updated) = 0 THEN
      RAISE EXCEPTION 'work_complete_task_v2 quota patch did not match';
    END IF;
    EXECUTE v_updated;
  END IF;

  SELECT pg_catalog.pg_get_functiondef('public.work_verify_and_reward(uuid,uuid,uuid)'::regprocedure)
    INTO v_definition;
  IF position('moneyverse:work-global-quota:' IN v_definition) = 0 THEN
    v_updated := pg_catalog.replace(
      v_definition,
      '  v_transaction uuid;',
      E'  v_transaction uuid;\n  v_daily_cap bigint;\n  v_weekly_cap bigint;\n  v_day_paid bigint;\n  v_week_paid bigint;'
    );
    v_updated := pg_catalog.replace(
      v_updated,
      '  -- Keep recording window statistics without clamping v_reward',
      E'  PERFORM pg_catalog.pg_advisory_xact_lock(\n    pg_catalog.hashtextextended(''moneyverse:work-global-quota:'' || p_actor::text, 0)\n  );\n\n  SELECT policy_row.daily_cap, policy_row.weekly_cap\n    INTO v_daily_cap, v_weekly_cap\n  FROM public.work_reward_policy_versions policy_row\n  WHERE policy_row.enabled AND policy_row.effective_at <= pg_catalog.clock_timestamp()\n  ORDER BY policy_row.effective_at DESC, policy_row.id DESC LIMIT 1;\n\n  SELECT coalesce(sum(receipt_row.reward_amount), 0) INTO v_day_paid\n  FROM public.work_reward_receipts receipt_row\n  WHERE receipt_row.user_id = p_actor\n    AND receipt_row.created_at >= public.server_game_day_start();\n\n  SELECT coalesce(sum(receipt_row.reward_amount), 0) INTO v_week_paid\n  FROM public.work_reward_receipts receipt_row\n  WHERE receipt_row.user_id = p_actor\n    AND receipt_row.created_at >= public.server_game_week_start();\n\n  v_reward := LEAST(\n    v_reward,\n    GREATEST(v_daily_cap - v_day_paid, 0),\n    GREATEST(v_weekly_cap - v_week_paid, 0)\n  );\n  IF v_reward <= 0 THEN\n    RAISE EXCEPTION USING ERRCODE = ''22023'', MESSAGE = ''work reward quota reached'';\n  END IF;\n\n  -- Keep recording window statistics under the enforced administrator caps'
    );
    IF v_updated = v_definition
       OR position('work reward quota reached' IN v_updated) = 0
       OR position('v_daily_cap bigint;' IN v_updated) = 0 THEN
      RAISE EXCEPTION 'work_verify_and_reward quota patch did not match';
    END IF;
    EXECUTE v_updated;
  END IF;
END;
$$;

ALTER FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_verify_and_reward(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid), public.work_verify_and_reward(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid), public.work_verify_and_reward(uuid, uuid, uuid)
  TO moneyverse_app;

COMMIT;
