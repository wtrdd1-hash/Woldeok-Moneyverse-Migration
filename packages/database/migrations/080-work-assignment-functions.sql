BEGIN;

CREATE OR REPLACE FUNCTION public.work_assign_task(p_key uuid, p_actor uuid, p_task uuid)
RETURNS TABLE(assignment_id uuid, task_id uuid, assigned_at timestamptz, expires_at timestamptz, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_assignment uuid; v_owner uuid; v_assigned timestamptz; v_expires timestamptz; v_limit integer;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_task IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid work assignment'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:work-assign:' || p_key::text, 0));
  SELECT id, user_id, assigned_at, expires_at INTO v_assignment, v_owner, v_assigned, v_expires FROM public.work_assignments WHERE id = p_key;
  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='work assignment belongs to another user'; END IF;
    RETURN QUERY SELECT v_assignment, p_task, v_assigned, v_expires, true; RETURN;
  END IF;
  SELECT daily_limit INTO v_limit FROM public.work_task_catalog WHERE id=p_task AND active FOR KEY SHARE;
  IF v_limit IS NULL OR NOT EXISTS (SELECT 1 FROM public.users WHERE id=p_actor AND status='active'::public.user_status) THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active work task required'; END IF;
  IF (SELECT count(*) FROM public.work_assignments a WHERE a.user_id=p_actor AND a.task_id=p_task AND a.assigned_at >= date_trunc('day', clock_timestamp() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul') >= v_limit THEN RAISE EXCEPTION USING ERRCODE='23505', MESSAGE='daily task limit reached'; END IF;
  INSERT INTO public.work_assignments(id,user_id,task_id,expires_at) VALUES(p_key,p_actor,p_task,clock_timestamp()+interval '24 hours') RETURNING id,assigned_at,expires_at INTO v_assignment,v_assigned,v_expires;
  RETURN QUERY SELECT v_assignment,p_task,v_assigned,v_expires,false;
END;
$$;

CREATE OR REPLACE FUNCTION public.work_submit_completion(p_key uuid, p_actor uuid, p_assignment uuid, p_evidence text)
RETURNS TABLE(assignment_id uuid, submitted_at timestamptz, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_owner uuid; v_status public.work_assignment_status; v_started timestamptz; v_expires timestamptz; v_minimum integer; v_submitted timestamptz;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_assignment IS NULL OR p_evidence IS NOT NULL AND char_length(p_evidence)>1000 THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid work completion'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:work-submit:' || p_key::text, 0));
  SELECT a.user_id,a.status,c.submitted_at INTO v_owner,v_status,v_submitted FROM public.work_assignments a JOIN public.work_completion_records c ON c.assignment_id=a.id WHERE c.id=p_key;
  IF FOUND THEN IF v_owner IS DISTINCT FROM p_actor THEN RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='work completion belongs to another user'; END IF; RETURN QUERY SELECT p_assignment,v_submitted,true; RETURN; END IF;
  SELECT a.user_id,a.status,a.assigned_at,a.expires_at,t.minimum_duration_seconds INTO v_owner,v_status,v_started,v_expires,v_minimum FROM public.work_assignments a JOIN public.work_task_catalog t ON t.id=a.task_id WHERE a.id=p_assignment FOR UPDATE OF a;
  IF v_owner IS DISTINCT FROM p_actor OR v_status <> 'assigned' THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='assign work before submitting'; END IF;
  IF clock_timestamp() > v_expires OR clock_timestamp() < v_started + make_interval(secs=>v_minimum) THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='work duration is not complete'; END IF;
  UPDATE public.work_assignments SET status='submitted',completed_at=clock_timestamp() WHERE id=p_assignment;
  INSERT INTO public.work_completion_records(id,assignment_id,quality_score,evidence_reference,verifier_result) VALUES(p_key,p_assignment,100,p_evidence,'submitted') RETURNING submitted_at INTO v_submitted;
  RETURN QUERY SELECT p_assignment,v_submitted,false;
END;
$$;

ALTER FUNCTION public.work_assign_task(uuid,uuid,uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.work_submit_completion(uuid,uuid,uuid,text) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_assign_task(uuid,uuid,uuid), public.work_submit_completion(uuid,uuid,uuid,text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_assign_task(uuid,uuid,uuid), public.work_submit_completion(uuid,uuid,uuid,text) TO moneyverse_app;
COMMIT;
