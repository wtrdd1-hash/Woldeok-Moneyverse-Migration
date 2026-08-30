BEGIN;

CREATE OR REPLACE FUNCTION public.work_verify_and_reward(p_key uuid, p_actor uuid, p_assignment uuid)
RETURNS TABLE(assignment_id uuid, reward_amount bigint, experience_amount bigint, transaction_id uuid, replayed boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE v_owner uuid; v_task uuid; v_status public.work_assignment_status; v_reward bigint; v_xp bigint; v_day date := (clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date; v_week date := date_trunc('week', clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date; v_day_paid bigint; v_week_paid bigint; v_daily_cap bigint; v_weekly_cap bigint; v_decay smallint; v_repeat bigint; v_cash uuid; v_mint uuid; v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_assignment IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid work verification'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('moneyverse:work-verify:' || p_key::text, 0));
  SELECT r.assignment_id,r.user_id,r.reward_amount,r.experience_amount,r.transaction_id INTO assignment_id,v_owner,reward_amount,experience_amount,transaction_id FROM public.work_reward_receipts r WHERE r.idempotency_key=p_key;
  IF FOUND THEN IF v_owner IS DISTINCT FROM p_actor THEN RAISE EXCEPTION USING ERRCODE='28000', MESSAGE='work reward receipt belongs to another user'; END IF; replayed:=true; RETURN NEXT; RETURN; END IF;
  SELECT a.user_id,a.task_id,a.status,t.base_reward,t.base_experience INTO v_owner,v_task,v_status,v_reward,v_xp FROM public.work_assignments a JOIN public.work_task_catalog t ON t.id=a.task_id WHERE a.id=p_assignment FOR UPDATE OF a,t;
  IF v_owner IS DISTINCT FROM p_actor OR v_status <> 'submitted' THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='submitted work assignment required'; END IF;
  SELECT daily_cap,weekly_cap,repeat_decay_percent INTO v_daily_cap,v_weekly_cap,v_decay FROM public.work_reward_policy_versions WHERE enabled AND effective_at<=clock_timestamp() ORDER BY effective_at DESC,id DESC LIMIT 1 FOR SHARE;
  IF v_daily_cap IS NULL THEN RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='work rewards are disabled'; END IF;
  SELECT count(*) INTO v_repeat FROM public.work_reward_receipts r JOIN public.work_assignments a ON a.id=r.assignment_id WHERE r.user_id=p_actor AND a.task_id=v_task AND r.created_at >= (v_day::timestamp AT TIME ZONE 'Asia/Seoul');
  v_reward := greatest(v_reward - (v_reward * v_decay * v_repeat / 100), 0);
  INSERT INTO public.work_reward_windows(user_id,window_start,window_kind) VALUES(p_actor,v_day,'day'),(p_actor,v_week,'week') ON CONFLICT DO NOTHING;
  SELECT paid_amount INTO v_day_paid FROM public.work_reward_windows WHERE user_id=p_actor AND window_start=v_day AND window_kind='day' FOR UPDATE;
  SELECT paid_amount INTO v_week_paid FROM public.work_reward_windows WHERE user_id=p_actor AND window_start=v_week AND window_kind='week' FOR UPDATE;
  v_reward := least(v_reward,greatest(v_daily_cap-v_day_paid,0),greatest(v_weekly_cap-v_week_paid,0));
  SELECT id INTO v_cash FROM public.accounts WHERE owner_user_id=p_actor AND account_type='USER_CASH'::public.account_type AND status='active'::public.account_status FOR UPDATE;
  SELECT id INTO v_mint FROM public.accounts WHERE system_key='mint' AND account_type='MINT'::public.account_type AND status='active'::public.account_status FOR UPDATE;
  IF v_cash IS NULL OR v_mint IS NULL THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='active work accounts required'; END IF;
  IF v_reward > 0 THEN SELECT public.economy_post_transaction(p_key,'WORK_TASK_REWARD',p_actor,NULL,jsonb_build_array(jsonb_build_object('accountId',v_mint,'amount',v_reward,'direction','credit'),jsonb_build_object('accountId',v_cash,'amount',v_reward,'direction','debit')),'game.work_task.rewarded',jsonb_build_object('assignmentId',p_assignment,'amount',v_reward,'experience',v_xp)) INTO v_transaction; END IF;
  UPDATE public.work_assignments SET status='approved',verified_at=clock_timestamp(),verified_by=p_actor,verification_reason='automatic verification' WHERE id=p_assignment;
  UPDATE public.work_completion_records SET verifier_result='approved',verifier_detail='automatic verification' WHERE assignment_id=p_assignment;
  INSERT INTO public.work_reward_receipts(idempotency_key,user_id,assignment_id,reward_amount,experience_amount,transaction_id) VALUES(p_key,p_actor,p_assignment,v_reward,v_xp,v_transaction);
  UPDATE public.work_reward_windows SET paid_amount=paid_amount+v_reward WHERE user_id=p_actor AND ((window_start=v_day AND window_kind='day') OR (window_start=v_week AND window_kind='week'));
  INSERT INTO public.user_job_progress(user_id,job_type,experience,level,selected_at) SELECT p_actor,t.job_type,v_xp,1,clock_timestamp() FROM public.work_task_catalog t WHERE t.id=v_task ON CONFLICT(user_id,job_type) DO UPDATE SET experience=user_job_progress.experience+excluded.experience,level=least(50,1+((user_job_progress.experience+excluded.experience)/100)::integer),changed_at=clock_timestamp();
  RETURN QUERY SELECT p_assignment,v_reward,v_xp,v_transaction,false;
END;
$$;
ALTER FUNCTION public.work_verify_and_reward(uuid,uuid,uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_verify_and_reward(uuid,uuid,uuid) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_verify_and_reward(uuid,uuid,uuid) TO moneyverse_app;
COMMIT;
