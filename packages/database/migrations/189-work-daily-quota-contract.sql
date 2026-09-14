-- Restore the authoritative per-task daily quota contract.
--
-- The task catalogue already stores each task's `daily_limit`. Migration 166
-- accidentally exposed `0` from the board and disabled the completion guard,
-- which made clients unable to reason about remaining daily work. This
-- migration keeps administrator feature switches separate from member quota:
-- operators may still pause/disable work, while normal enabled operation uses
-- the catalogue quota consistently across board, direct completion and the
-- legacy assignment -> verify flow.
BEGIN;

CREATE OR REPLACE FUNCTION public.work_task_board(p_actor uuid)
RETURNS TABLE(
  task_id uuid, code text, name text, description text,
  job_type public.work_job_type, difficulty smallint,
  base_reward bigint, base_experience bigint,
  minimum_duration_seconds integer, daily_limit integer,
  taken_today integer, reward_preview bigint, recommended boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_day_start timestamptz := (v_day::timestamp AT TIME ZONE 'Asia/Seoul');
  v_active_job text;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active user required';
  END IF;

  SELECT progress_row.job_type::text INTO v_active_job
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor AND progress_row.is_active
  ORDER BY progress_row.selected_at DESC NULLS LAST
  LIMIT 1;

  RETURN QUERY
  WITH standing AS (
    SELECT task_row.id, task_row.code, task_row.name, task_row.description,
           task_row.job_type, task_row.difficulty, task_row.base_reward,
           task_row.base_experience, task_row.minimum_duration_seconds,
           task_row.daily_limit,
           (
             SELECT pg_catalog.count(*)
             FROM public.work_reward_receipts AS receipt_row
             JOIN public.work_assignments AS assignment_row
               ON assignment_row.id = receipt_row.assignment_id
             WHERE receipt_row.user_id = p_actor
               AND assignment_row.task_id = task_row.id
               AND receipt_row.created_at >= v_day_start
           )::integer AS taken_today
    FROM public.work_task_catalog AS task_row
    WHERE task_row.active
  ), suggested AS (
    SELECT standing_row.id
    FROM standing AS standing_row
    WHERE v_active_job IS NULL OR standing_row.job_type::text = v_active_job
    ORDER BY pg_catalog.hashtextextended(
      'moneyverse:work-board:' || p_actor::text || ':' || standing_row.id::text || ':' || v_day::text,
      0
    ), standing_row.id
    LIMIT CASE WHEN v_active_job IS NULL THEN 3 ELSE 1 END
  )
  SELECT standing_row.id, standing_row.code, standing_row.name,
         standing_row.description, standing_row.job_type,
         standing_row.difficulty, standing_row.base_reward,
         standing_row.base_experience, standing_row.minimum_duration_seconds,
         standing_row.daily_limit, standing_row.taken_today,
         public.work_reward_preview(p_actor, standing_row.id),
         EXISTS (SELECT 1 FROM suggested AS suggested_row WHERE suggested_row.id = standing_row.id)
  FROM standing AS standing_row
  ORDER BY
    (v_active_job IS NOT NULL AND standing_row.job_type::text = v_active_job) DESC,
    standing_row.difficulty,
    standing_row.base_reward,
    standing_row.code;
END;
$$;

ALTER FUNCTION public.work_task_board(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.work_task_board(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_task_board(uuid) TO moneyverse_app;

DO $$
DECLARE
  v_definition text;
  v_updated text;
BEGIN
  -- Direct mobile/web completion: serialize the quota check for this member and
  -- task, then refuse the next completion after the configured limit is filled.
  SELECT pg_catalog.pg_get_functiondef('public.work_complete_task_v2(uuid,uuid,uuid)'::regprocedure)
  INTO v_definition;

  IF position('daily completion limit reached for this task' IN v_definition) = 0 THEN
    v_updated := pg_catalog.replace(
      v_definition,
      '  v_is_overtime := false;',
      '  PERFORM pg_catalog.pg_advisory_xact_lock(\n    pg_catalog.hashtextextended(''moneyverse:work-quota:'' || p_actor::text || '':'' || p_task_id::text, 0)\n  );\n\n  IF v_task.daily_limit > 0 AND v_today_completions >= v_task.daily_limit THEN\n    RAISE EXCEPTION USING ERRCODE = ''22023'', MESSAGE = ''daily completion limit reached for this task'';\n  END IF;\n\n  v_is_overtime := false;'
    );
    IF v_updated = v_definition THEN
      RAISE EXCEPTION 'work_complete_task_v2 definition did not match expected quota insertion point';
    END IF;
    EXECUTE v_updated;
  END IF;

  -- Legacy assignment verification must enforce the same quota. The advisory
  -- lock makes concurrent direct/legacy completions for one task serialize.
  SELECT pg_catalog.pg_get_functiondef('public.work_verify_and_reward(uuid,uuid,uuid)'::regprocedure)
  INTO v_definition;

  IF position('daily completion limit reached for this task' IN v_definition) = 0 THEN
    v_updated := pg_catalog.replace(
      v_definition,
      '  -- Legacy assignment completion now shares the same full-repeat, level-aware',
      '  PERFORM pg_catalog.pg_advisory_xact_lock(\n    pg_catalog.hashtextextended(''moneyverse:work-quota:'' || p_actor::text || '':'' || v_task::text, 0)\n  );\n\n  IF COALESCE((SELECT task_row.daily_limit FROM public.work_task_catalog AS task_row WHERE task_row.id = v_task), 0) > 0\n     AND v_repeat >= (SELECT task_row.daily_limit FROM public.work_task_catalog AS task_row WHERE task_row.id = v_task) THEN\n    RAISE EXCEPTION USING ERRCODE = ''22023'', MESSAGE = ''daily completion limit reached for this task'';\n  END IF;\n\n  -- Legacy assignment completion now shares the same full-repeat, level-aware'
    );
    IF v_updated = v_definition THEN
      RAISE EXCEPTION 'work_verify_and_reward definition did not match expected quota insertion point';
    END IF;
    EXECUTE v_updated;
  END IF;
END;
$$;

COMMIT;
