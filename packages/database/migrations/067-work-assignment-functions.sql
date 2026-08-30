-- Assigning a task, and submitting it as done.
--
-- Both follow the idempotency template from 045: validate, take an advisory
-- lock on the key, look for a receipt, refuse a receipt that belongs to
-- somebody else with 28000, then do the work.
--
-- The caller supplies the row's primary key. That is deliberate -- it makes
-- the receipt and the row the same object, so there is no window in which one
-- exists without the other -- and it is safe because the replay branch checks
-- ownership before returning anything.

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
  v_limit integer;
  v_taken integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_task IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid work assignment';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:work-assign:' || p_key::text, 0)
  );

  -- The stored row, not the caller's parameters. A replay that names a
  -- different task must report the task that was actually assigned.
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

  SELECT task_row.daily_limit INTO v_limit
  FROM public.work_task_catalog AS task_row
  WHERE task_row.id = p_task AND task_row.active
  FOR KEY SHARE;

  IF v_limit IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active work task required';
  END IF;

  -- A second lock, on the member and task rather than on the key. The key
  -- lock serialises retries of one request; it does nothing about two
  -- different requests counting the same day at the same time, which is how
  -- a daily limit gets exceeded.
  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:work-assign-day:' || p_actor::text || ':' || p_task::text, 0)
  );

  SELECT count(*) INTO v_taken
  FROM public.work_assignments AS assignment_row
  WHERE assignment_row.user_id = p_actor
    AND assignment_row.task_id = p_task
    AND assignment_row.assigned_at
      >= date_trunc('day', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul';

  IF v_taken >= v_limit THEN
    RAISE EXCEPTION USING ERRCODE = '23505', MESSAGE = 'daily task limit reached';
  END IF;

  INSERT INTO public.work_assignments (id, user_id, task_id, expires_at)
  VALUES (p_key, p_actor, p_task, pg_catalog.clock_timestamp() + interval '24 hours')
  -- Qualified, because `task_id`, `assigned_at` and `expires_at` are OUT
  -- parameters as well as columns, and plpgsql defaults to
  -- variable_conflict = error: unqualified, this raises 42702 on every call.
  RETURNING work_assignments.id, work_assignments.task_id,
            work_assignments.assigned_at, work_assignments.expires_at
  INTO assignment_id, task_id, assigned_at, expires_at;

  replayed := false;
  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.work_submit_completion(
  p_key uuid,
  p_actor uuid,
  p_assignment uuid,
  p_evidence text
)
RETURNS TABLE(assignment_id uuid, submitted_at timestamptz, replayed boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_owner uuid;
  v_status public.work_assignment_status;
  v_started timestamptz;
  v_expires timestamptz;
  v_minimum integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_assignment IS NULL
    OR (p_evidence IS NOT NULL AND pg_catalog.char_length(p_evidence) > 1000) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid work completion';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:work-submit:' || p_key::text, 0)
  );

  SELECT record_row.assignment_id, assignment_row.user_id, record_row.submitted_at
  INTO assignment_id, v_owner, submitted_at
  FROM public.work_completion_records AS record_row
  JOIN public.work_assignments AS assignment_row ON assignment_row.id = record_row.assignment_id
  WHERE record_row.id = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'work completion belongs to another user';
    END IF;
    replayed := true;
    RETURN NEXT;
    RETURN;
  END IF;

  -- `users.status`, not `accounts.status`. `admin_set_user_restriction` (026)
  -- restricts the member and leaves the account alone, so checking the
  -- account would let a restricted member walk the whole flow to a payout.
  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  SELECT assignment_row.user_id, assignment_row.status, assignment_row.assigned_at,
         assignment_row.expires_at, task_row.minimum_duration_seconds
  INTO v_owner, v_status, v_started, v_expires, v_minimum
  FROM public.work_assignments AS assignment_row
  JOIN public.work_task_catalog AS task_row ON task_row.id = assignment_row.task_id
  WHERE assignment_row.id = p_assignment
  FOR UPDATE OF assignment_row;

  IF v_owner IS DISTINCT FROM p_actor OR v_status <> 'assigned' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'assign work before submitting';
  END IF;

  IF pg_catalog.clock_timestamp() > v_expires THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'the assignment has expired';
  END IF;

  IF pg_catalog.clock_timestamp() < v_started + pg_catalog.make_interval(secs => v_minimum) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'work duration is not complete';
  END IF;

  UPDATE public.work_assignments AS assignment_row
  SET status = 'submitted', completed_at = pg_catalog.clock_timestamp()
  WHERE assignment_row.id = p_assignment;

  INSERT INTO public.work_completion_records (
    id, assignment_id, quality_score, evidence_reference, verifier_result
  ) VALUES (p_key, p_assignment, 100, p_evidence, 'submitted')
  RETURNING work_completion_records.assignment_id, work_completion_records.submitted_at
  INTO assignment_id, submitted_at;

  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.work_assign_task(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_submit_completion(uuid, uuid, uuid, text) OWNER TO moneyverse_migrator;

REVOKE ALL PRIVILEGES ON FUNCTION public.work_assign_task(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_submit_completion(uuid, uuid, uuid, text)
  FROM PUBLIC, moneyverse_app;

GRANT EXECUTE ON FUNCTION public.work_assign_task(uuid, uuid, uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_submit_completion(uuid, uuid, uuid, text) TO moneyverse_app;

COMMIT;
