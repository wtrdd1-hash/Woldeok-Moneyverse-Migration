BEGIN;

CREATE OR REPLACE FUNCTION public.work_complete_task_v2(
  p_actor uuid,
  p_task_id uuid,
  p_idempotency_key uuid
)
RETURNS TABLE(
  reward_amount bigint,
  experience_gained bigint,
  current_level integer,
  current_experience bigint,
  level_up boolean,
  transaction_id uuid
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE
  v_task record;
  v_progress record;
  v_receipt record;
  v_assignment uuid;
  v_cash uuid;
  v_mint uuid;
  v_level_mult numeric;
  v_reward bigint;
  v_exp bigint;
  v_new_exp bigint;
  v_new_level integer;
  v_level_up boolean := false;
  v_tx_id uuid;
  v_today_completions integer;
  v_now timestamptz := pg_catalog.clock_timestamp();
BEGIN
  IF p_actor IS NULL OR p_task_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor, task and idempotency key are required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:work_complete_task_v2:' || p_idempotency_key::text, 0)
  );

  SELECT receipt_row.reward_amount, receipt_row.experience_amount,
         receipt_row.transaction_id, assignment_row.task_id
  INTO v_receipt
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row ON assignment_row.id = receipt_row.assignment_id
  WHERE receipt_row.idempotency_key = p_idempotency_key
    AND receipt_row.user_id = p_actor;

  IF FOUND THEN
    IF v_receipt.task_id IS DISTINCT FROM p_task_id THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'work completion key belongs to another task';
    END IF;

    SELECT progress_row.level, progress_row.experience
    INTO current_level, current_experience
    FROM public.user_job_progress AS progress_row
    JOIN public.work_task_catalog AS task_row ON task_row.job_type = progress_row.job_type
    WHERE progress_row.user_id = p_actor AND task_row.id = p_task_id;

    reward_amount := v_receipt.reward_amount;
    experience_gained := v_receipt.experience_amount;
    level_up := false;
    transaction_id := v_receipt.transaction_id;
    RETURN NEXT;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.work_reward_receipts AS receipt_row
    WHERE receipt_row.idempotency_key = p_idempotency_key
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'work completion belongs to another user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active member required';
  END IF;

  SELECT task_row.* INTO v_task
  FROM public.work_task_catalog AS task_row
  WHERE task_row.id = p_task_id AND task_row.active = true;

  IF v_task IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'task not found or inactive';
  END IF;

  SELECT progress_row.* INTO v_progress
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor AND progress_row.is_active = true
  FOR UPDATE;

  IF v_progress IS NULL OR v_progress.job_type IS DISTINCT FROM v_task.job_type THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'task job type does not match caller active job';
  END IF;

  SELECT pg_catalog.count(*)::integer INTO v_today_completions
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row ON assignment_row.id = receipt_row.assignment_id
  WHERE receipt_row.user_id = p_actor
    AND assignment_row.task_id = p_task_id
    AND receipt_row.created_at >= pg_catalog.date_trunc('day', v_now AT TIME ZONE 'Asia/Seoul')
      AT TIME ZONE 'Asia/Seoul';

  IF v_today_completions >= v_task.daily_limit THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'daily completion limit reached for this task';
  END IF;

  v_level_mult := 1.0 + ((v_progress.level - 1) * 0.05);
  v_reward := pg_catalog.round(v_task.base_reward * v_level_mult);
  v_exp := pg_catalog.round(v_task.base_experience * v_level_mult);
  v_new_exp := v_progress.experience + v_exp;
  v_new_level := v_progress.level;

  WHILE v_new_level < 50 AND v_new_exp >= (v_new_level * v_new_level * 100) LOOP
    v_new_level := v_new_level + 1;
    v_level_up := true;
  END LOOP;

  SELECT account_row.id INTO v_cash
  FROM public.accounts AS account_row
  WHERE account_row.owner_user_id = p_actor
    AND account_row.account_type = 'USER_CASH'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  SELECT account_row.id INTO v_mint
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'mint'
    AND account_row.account_type = 'MINT'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_mint IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active cash or mint account required';
  END IF;

  v_assignment := pg_catalog.gen_random_uuid();
  INSERT INTO public.work_assignments (
    id, user_id, task_id, assigned_at, expires_at, status, completed_at,
    verified_at, verified_by, verification_reason
  ) VALUES (
    v_assignment, p_actor, p_task_id, v_now, v_now + interval '1 minute', 'approved', v_now,
    v_now, p_actor, 'direct career task completion'
  );

  INSERT INTO public.work_completion_records (
    assignment_id, submitted_at, quality_score, verifier_result, verifier_detail
  ) VALUES (
    v_assignment, v_now, 100, 'approved', 'direct career task completion'
  );

  SELECT public.economy_post_transaction(
    p_idempotency_key,
    'WORK_REWARD',
    p_actor,
    NULL,
    pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', v_reward, 'direction', 'credit'),
      pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_reward, 'direction', 'debit')
    ),
    'work.task_completed',
    pg_catalog.jsonb_build_object(
      'assignmentId', v_assignment,
      'taskId', p_task_id,
      'jobType', v_task.job_type,
      'reward', v_reward,
      'exp', v_exp
    )
  ) INTO v_tx_id;

  UPDATE public.user_job_progress AS progress_row
  SET experience = v_new_exp,
      level = v_new_level,
      changed_at = v_now
  WHERE progress_row.user_id = p_actor AND progress_row.job_type = v_task.job_type;

  INSERT INTO public.work_reward_receipts (
    idempotency_key, user_id, assignment_id, reward_amount, experience_amount, transaction_id
  ) VALUES (
    p_idempotency_key, p_actor, v_assignment, v_reward, v_exp, v_tx_id
  );

  reward_amount := v_reward;
  experience_gained := v_exp;
  current_level := v_new_level;
  current_experience := v_new_exp;
  level_up := v_level_up;
  transaction_id := v_tx_id;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) TO moneyverse_app;

COMMIT;
