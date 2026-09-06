-- The direct completion path became unlimited in 157, but the older
-- assign-submit-verify path still refused assignments after the catalogue's
-- legacy daily_limit. Keep both public paths consistent and retain the old
-- return column only as an API-compatibility sentinel (zero means unlimited).
BEGIN;

CREATE OR REPLACE FUNCTION public.work_assign_task(
  p_key uuid,
  p_actor uuid,
  p_task uuid
)
RETURNS TABLE(
  assignment_id uuid,
  task_id uuid,
  assigned_at timestamptz,
  expires_at timestamptz,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_owner uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_task IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid work assignment';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:work-assign:' || p_key::text, 0)
  );

  SELECT assignment_row.id, assignment_row.user_id, assignment_row.task_id,
         assignment_row.assigned_at, assignment_row.expires_at
  INTO assignment_id, v_owner, task_id, assigned_at, expires_at
  FROM public.work_assignments AS assignment_row
  WHERE assignment_row.id = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'work assignment belongs to another user';
    END IF;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.work_task_catalog AS task_row
    WHERE task_row.id = p_task AND task_row.active
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active work task required';
  END IF;

  INSERT INTO public.work_assignments (id, user_id, task_id, expires_at)
  VALUES (p_key, p_actor, p_task, pg_catalog.clock_timestamp() + interval '24 hours')
  RETURNING work_assignments.id, work_assignments.task_id,
            work_assignments.assigned_at, work_assignments.expires_at
  INTO assignment_id, task_id, assigned_at, expires_at;

  replayed := false;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.work_task_board(p_actor uuid)
RETURNS TABLE(
  task_id uuid,
  code text,
  name text,
  description text,
  job_type public.work_job_type,
  difficulty smallint,
  base_reward bigint,
  base_experience bigint,
  minimum_duration_seconds integer,
  daily_limit integer,
  taken_today integer,
  reward_preview bigint,
  recommended boolean
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
  LIMIT 1;

  RETURN QUERY
  WITH standing AS (
    SELECT
      task_row.id,
      task_row.code,
      task_row.name,
      task_row.description,
      task_row.job_type,
      task_row.difficulty,
      task_row.base_reward,
      task_row.base_experience,
      task_row.minimum_duration_seconds,
      (
        SELECT pg_catalog.count(*)
        FROM public.work_assignments AS assignment_row
        WHERE assignment_row.user_id = p_actor
          AND assignment_row.task_id = task_row.id
          AND assignment_row.assigned_at >= v_day_start
      )::integer AS taken_today
    FROM public.work_task_catalog AS task_row
    WHERE task_row.active
  ),
  suggested AS (
    SELECT standing_row.id
    FROM standing AS standing_row
    ORDER BY pg_catalog.hashtextextended(
      'moneyverse:work-board:' || p_actor::text || ':' || standing_row.id::text || ':' || v_day::text,
      0
    ), standing_row.id
    LIMIT 3
  )
  SELECT
    standing_row.id,
    standing_row.code,
    standing_row.name,
    standing_row.description,
    standing_row.job_type,
    standing_row.difficulty,
    standing_row.base_reward,
    standing_row.base_experience,
    standing_row.minimum_duration_seconds,
    0::integer,
    standing_row.taken_today,
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

ALTER FUNCTION public.work_assign_task(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_task_board(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_assign_task(uuid, uuid, uuid), public.work_task_board(uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_assign_task(uuid, uuid, uuid), public.work_task_board(uuid)
  TO moneyverse_app;

COMMIT;
