-- 208-work-economic-command-envelope.sql
-- Update version: v2026.09.19.245
-- P0 ECON-233-02: adopt the common immutable economic command envelope for work rewards.
-- Forward-only: previously applied migrations and ledger history remain unchanged.

BEGIN;

CREATE OR REPLACE FUNCTION public.work_verify_and_reward(
  p_key uuid,
  p_actor uuid,
  p_assignment uuid
)
RETURNS TABLE(assignment_id uuid, reward_amount bigint, experience_amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_command uuid; v_command_replayed boolean; v_command_tx uuid; v_command_result jsonb;
  v_owner uuid; v_task uuid; v_status public.work_assignment_status;
  v_reward bigint; v_xp bigint; v_cash uuid; v_mint uuid; v_transaction uuid;
  v_hash bytea;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_assignment IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid work verification';
  END IF;

  -- Hash only immutable request identity; authoritative reward is resolved below under locks.
  v_hash := pg_catalog.digest(pg_catalog.convert_to(p_assignment::text, 'UTF8'), 'sha256');
  SELECT c.command_id, c.replayed, c.ledger_transaction_id, c.result_snapshot
    INTO v_command, v_command_replayed, v_command_tx, v_command_result
  FROM public.economic_command_claim(p_actor, 'work.reward', p_assignment::text, p_key, v_hash, NULL) AS c;

  IF v_command_replayed THEN
    assignment_id := (v_command_result->>'assignmentId')::uuid;
    reward_amount := (v_command_result->>'rewardAmount')::bigint;
    experience_amount := (v_command_result->>'experienceAmount')::bigint;
    transaction_id := v_command_tx;
    replayed := true;
    RETURN NEXT; RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id=p_actor AND u.status='active'::public.user_status) THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active member required';
  END IF;

  SELECT a.user_id, a.task_id, a.status, t.base_reward, t.base_experience
    INTO v_owner, v_task, v_status, v_reward, v_xp
  FROM public.work_assignments a JOIN public.work_task_catalog t ON t.id=a.task_id
  WHERE a.id=p_assignment FOR UPDATE OF a;
  IF v_owner IS DISTINCT FROM p_actor OR v_status <> 'submitted' THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='submitted work assignment required';
  END IF;

  SELECT a.id INTO v_cash FROM public.accounts a
   WHERE a.owner_user_id=p_actor AND a.account_type='USER_CASH'::public.account_type AND a.status='active'::public.account_status FOR UPDATE;
  SELECT a.id INTO v_mint FROM public.accounts a
   WHERE a.system_key='mint' AND a.account_type='MINT'::public.account_type AND a.status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_mint IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active work accounts required'; END IF;

  -- Current policy removes work caps/decay; authoritative task amount is paid on every approved completion.
  IF v_reward > 0 THEN
    SELECT public.economy_post_transaction(p_key,'WORK_TASK_REWARD',p_actor,NULL,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('accountId',v_mint,'amount',v_reward,'direction','credit'),
        pg_catalog.jsonb_build_object('accountId',v_cash,'amount',v_reward,'direction','debit')),
      'game.work_task.rewarded',
      pg_catalog.jsonb_build_object('assignmentId',p_assignment,'amount',v_reward,'experience',v_xp)) INTO v_transaction;
  END IF;

  UPDATE public.work_assignments SET status='approved', verified_at=pg_catalog.clock_timestamp(), verified_by=p_actor,
    verification_reason='automatic verification' WHERE id=p_assignment;
  UPDATE public.work_completion_records SET verifier_result='approved', verifier_detail='automatic verification' WHERE assignment_id=p_assignment;
  INSERT INTO public.work_reward_receipts(idempotency_key,user_id,assignment_id,reward_amount,experience_amount,transaction_id)
    VALUES(p_key,p_actor,p_assignment,v_reward,v_xp,v_transaction);
  INSERT INTO public.user_job_progress(user_id,job_type,experience,level,selected_at)
    SELECT p_actor,t.job_type,v_xp,1,pg_catalog.clock_timestamp() FROM public.work_task_catalog t WHERE t.id=v_task
    ON CONFLICT(user_id,job_type) DO UPDATE SET experience=user_job_progress.experience+excluded.experience,
      level=least(50,1+((user_job_progress.experience+excluded.experience)/100)::integer), changed_at=pg_catalog.clock_timestamp();

  v_command_result := pg_catalog.jsonb_build_object('assignmentId',p_assignment,'rewardAmount',v_reward,'experienceAmount',v_xp);
  PERFORM public.economic_command_complete(v_command,v_transaction,v_command_result);
  assignment_id:=p_assignment; reward_amount:=v_reward; experience_amount:=v_xp; transaction_id:=v_transaction; replayed:=false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.work_verify_and_reward(uuid,uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_verify_and_reward(uuid,uuid,uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_verify_and_reward(uuid,uuid,uuid) TO moneyverse_app;

COMMIT;
