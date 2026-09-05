-- Migration 130: Remove work reward daily and weekly caps for unlimited payouts

BEGIN;

-- 1. Redefine work_verify_and_reward without daily_cap or weekly_cap clamping
CREATE OR REPLACE FUNCTION public.work_verify_and_reward(
  p_key uuid,
  p_actor uuid,
  p_assignment uuid
)
RETURNS TABLE(
  assignment_id uuid,
  reward_amount bigint,
  experience_amount bigint,
  transaction_id uuid,
  replayed boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_owner uuid;
  v_task uuid;
  v_status public.work_assignment_status;
  v_reward bigint;
  v_xp bigint;
  v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_week date := date_trunc('week', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_decay smallint;
  v_repeat bigint;
  v_cash uuid;
  v_mint uuid;
  v_transaction uuid;
BEGIN
  IF p_key IS NULL OR p_actor IS NULL OR p_assignment IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid work verification';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:work-verify:' || p_key::text, 0)
  );

  SELECT receipt_row.assignment_id, receipt_row.user_id, receipt_row.reward_amount,
         receipt_row.experience_amount, receipt_row.transaction_id
  INTO assignment_id, v_owner, reward_amount, experience_amount, transaction_id
  FROM public.work_reward_receipts AS receipt_row
  WHERE receipt_row.idempotency_key = p_key;

  IF FOUND THEN
    IF v_owner IS DISTINCT FROM p_actor THEN
      RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'work reward receipt belongs to another user';
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

  SELECT assignment_row.user_id, assignment_row.task_id, assignment_row.status,
         task_row.base_reward, task_row.base_experience
  INTO v_owner, v_task, v_status, v_reward, v_xp
  FROM public.work_assignments AS assignment_row
  JOIN public.work_task_catalog AS task_row ON task_row.id = assignment_row.task_id
  WHERE assignment_row.id = p_assignment
  FOR UPDATE OF assignment_row;

  IF v_owner IS DISTINCT FROM p_actor OR v_status <> 'submitted' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'submitted work assignment required';
  END IF;

  SELECT policy_row.repeat_decay_percent
  INTO v_decay
  FROM public.work_reward_policy_versions AS policy_row
  WHERE policy_row.enabled AND policy_row.effective_at <= pg_catalog.clock_timestamp()
  ORDER BY policy_row.effective_at DESC, policy_row.id DESC
  LIMIT 1
  FOR SHARE;

  IF v_decay IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'work rewards are disabled';
  END IF;

  SELECT count(*) INTO v_repeat
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row ON assignment_row.id = receipt_row.assignment_id
  WHERE receipt_row.user_id = p_actor
    AND assignment_row.task_id = v_task
    AND receipt_row.created_at >= (v_day::timestamp AT TIME ZONE 'Asia/Seoul');

  v_reward := greatest(v_reward - (v_reward * v_decay * v_repeat / 100), 0);

  -- Keep recording window statistics without clamping v_reward
  INSERT INTO public.work_reward_windows (user_id, window_start, window_kind)
  VALUES (p_actor, v_day, 'day'), (p_actor, v_week, 'week')
  ON CONFLICT DO NOTHING;

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
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active work accounts required';
  END IF;

  IF v_reward > 0 THEN
    SELECT public.economy_post_transaction(
      p_key,
      'WORK_TASK_REWARD',
      p_actor,
      NULL,
      pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', v_reward, 'direction', 'credit'),
        pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_reward, 'direction', 'debit')
      ),
      'game.work_task.rewarded',
      pg_catalog.jsonb_build_object('assignmentId', p_assignment, 'amount', v_reward, 'experience', v_xp)
    ) INTO v_transaction;
  END IF;

  UPDATE public.work_assignments AS assignment_row
  SET status = 'approved',
      verified_at = pg_catalog.clock_timestamp(),
      verified_by = p_actor,
      verification_reason = 'automatic verification'
  WHERE assignment_row.id = p_assignment;

  UPDATE public.work_completion_records AS record_row
  SET verifier_result = 'approved', verifier_detail = 'automatic verification'
  WHERE record_row.assignment_id = p_assignment;

  INSERT INTO public.work_reward_receipts (
    idempotency_key, user_id, assignment_id, reward_amount, experience_amount, transaction_id
  ) VALUES (p_key, p_actor, p_assignment, v_reward, v_xp, v_transaction);

  UPDATE public.work_reward_windows AS window_row
  SET paid_amount = window_row.paid_amount + v_reward
  WHERE window_row.user_id = p_actor
    AND ((window_row.window_start = v_day AND window_row.window_kind = 'day')
      OR (window_row.window_start = v_week AND window_row.window_kind = 'week'));

  INSERT INTO public.user_job_progress (user_id, job_type, experience, level, selected_at)
  SELECT p_actor, task_row.job_type, v_xp, 1, pg_catalog.clock_timestamp()
  FROM public.work_task_catalog AS task_row
  WHERE task_row.id = v_task
  ON CONFLICT (user_id, job_type) DO UPDATE
  SET experience = user_job_progress.experience + excluded.experience,
      level = least(50, 1 + ((user_job_progress.experience + excluded.experience) / 100)::integer),
      changed_at = pg_catalog.clock_timestamp();

  assignment_id := p_assignment;
  reward_amount := v_reward;
  experience_amount := v_xp;
  transaction_id := v_transaction;
  replayed := false;
  RETURN NEXT;
END;
$$;

ALTER FUNCTION public.work_verify_and_reward(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_verify_and_reward(uuid, uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_verify_and_reward(uuid, uuid, uuid) TO moneyverse_app;


-- 2. Redefine work_reward_preview without daily_cap or weekly_cap clamping
CREATE OR REPLACE FUNCTION public.work_reward_preview(
  p_actor uuid,
  p_task uuid
)
RETURNS bigint
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_reward bigint;
  v_decay smallint;
  v_repeat bigint;
BEGIN
  IF p_actor IS NULL OR p_task IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT task_row.base_reward INTO v_reward
  FROM public.work_task_catalog AS task_row
  WHERE task_row.id = p_task AND task_row.active;

  IF v_reward IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT policy_row.repeat_decay_percent
  INTO v_decay
  FROM public.work_reward_policy_versions AS policy_row
  WHERE policy_row.enabled AND policy_row.effective_at <= pg_catalog.clock_timestamp()
  ORDER BY policy_row.effective_at DESC, policy_row.id DESC
  LIMIT 1;

  IF v_decay IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT count(*) INTO v_repeat
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row ON assignment_row.id = receipt_row.assignment_id
  WHERE receipt_row.user_id = p_actor
    AND assignment_row.task_id = p_task
    AND receipt_row.created_at >= (v_day::timestamp AT TIME ZONE 'Asia/Seoul');

  v_reward := greatest(v_reward - (v_reward * v_decay * v_repeat / 100), 0);

  RETURN v_reward;
END;
$$;

ALTER FUNCTION public.work_reward_preview(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.work_reward_preview(uuid, uuid)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_reward_preview(uuid, uuid) TO moneyverse_app;


-- 3. Relax check constraints on work_reward_policy_versions and insert unlimited version
ALTER TABLE public.work_reward_policy_versions DROP CONSTRAINT IF EXISTS work_reward_policy_versions_daily_cap_check;
ALTER TABLE public.work_reward_policy_versions DROP CONSTRAINT IF EXISTS work_reward_policy_versions_weekly_cap_check;
ALTER TABLE public.work_reward_policy_versions ADD CONSTRAINT work_reward_policy_versions_daily_cap_check CHECK (daily_cap >= 0);
ALTER TABLE public.work_reward_policy_versions ADD CONSTRAINT work_reward_policy_versions_weekly_cap_check CHECK (weekly_cap >= 0);

INSERT INTO public.work_reward_policy_versions (
  daily_cap, weekly_cap, repeat_decay_percent, enabled, reason
) VALUES (
  999999999, 999999999, 0, true, 'Work reward caps removed: unlimited WLD rewards'
);

-- 4. Pause auto adjustment of work caps in economy_policy_knobs
UPDATE public.economy_policy_knobs
SET auto_adjustable = false,
    paused_reason = 'Work reward caps removed: payouts are unlimited'
WHERE knob_key IN ('work.daily_cap', 'work.weekly_cap');

COMMIT;
