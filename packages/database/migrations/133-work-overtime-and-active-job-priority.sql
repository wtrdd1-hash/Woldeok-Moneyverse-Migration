-- 133-work-overtime-and-active-job-priority.sql
-- 1. work_complete_task_v2: Overtime mode allowing unlimited play with 25% WLD and 100% EXP
-- 2. work_task_board: Priority sorting by active job first, then unspent daily limit

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
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  v_task record;
  v_progress record;
  v_receipt record;
  v_assignment uuid;
  v_cash uuid;
  v_mint uuid;
  v_level_mult numeric;
  v_base_reward bigint;
  v_reward bigint;
  v_exp bigint;
  v_new_exp bigint;
  v_new_level integer;
  v_level_up boolean := false;
  v_tx_id uuid;
  v_today_completions integer;
  v_is_overtime boolean := false;
  v_now timestamptz := pg_catalog.clock_timestamp();
  v_day date := (v_now AT TIME ZONE 'Asia/Seoul')::date;
  v_week date := date_trunc('week', v_now AT TIME ZONE 'Asia/Seoul')::date;
  v_daily_cap bigint;
  v_weekly_cap bigint;
  v_day_paid bigint;
  v_week_paid bigint;
BEGIN
  IF p_actor IS NULL OR p_task_id IS NULL OR p_idempotency_key IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'actor, task and idempotency key are required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:work_complete_task_v2:' || p_idempotency_key::text, 0)
  );

  -- 멱등성 검사
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

  -- 1. 작업별 일일 완료 횟수 집계 및 추가 특근(Overtime) 모드 분기
  SELECT pg_catalog.count(*)::integer INTO v_today_completions
  FROM public.work_reward_receipts AS receipt_row
  JOIN public.work_assignments AS assignment_row ON assignment_row.id = receipt_row.assignment_id
  WHERE receipt_row.user_id = p_actor
    AND assignment_row.task_id = p_task_id
    AND receipt_row.created_at >= pg_catalog.date_trunc('day', v_now AT TIME ZONE 'Asia/Seoul')
      AT TIME ZONE 'Asia/Seoul';

  v_is_overtime := (v_today_completions >= v_task.daily_limit);

  -- 2. 전역 일간/주간 캡 정책 조회
  SELECT policy_row.daily_cap, policy_row.weekly_cap
  INTO v_daily_cap, v_weekly_cap
  FROM public.work_reward_policy_versions AS policy_row
  WHERE policy_row.enabled AND policy_row.effective_at <= v_now
  ORDER BY policy_row.effective_at DESC, policy_row.id DESC
  LIMIT 1
  FOR SHARE;

  IF v_daily_cap IS NULL THEN
    v_daily_cap := 10000;
    v_weekly_cap := 50000;
  END IF;

  -- 3. 일간 및 주간 윈도우 레코드 생성 및 잠금
  INSERT INTO public.work_reward_windows (user_id, window_start, window_kind, paid_amount)
  VALUES (p_actor, v_day, 'day', 0), (p_actor, v_week, 'week', 0)
  ON CONFLICT DO NOTHING;

  SELECT window_row.paid_amount INTO v_day_paid
  FROM public.work_reward_windows AS window_row
  WHERE window_row.user_id = p_actor AND window_row.window_start = v_day
    AND window_row.window_kind = 'day'
  FOR UPDATE;

  SELECT window_row.paid_amount INTO v_week_paid
  FROM public.work_reward_windows AS window_row
  WHERE window_row.user_id = p_actor AND window_row.window_start = v_week
    AND window_row.window_kind = 'week'
  FOR UPDATE;

  -- 4. 보상 및 경험치 계산 (레벨 보너스 적용 & 특근 분기)
  v_level_mult := 1.0 + ((v_progress.level - 1) * 0.05);

  IF v_is_overtime THEN
    -- 추가 특근: 기본 보상의 25% (최소 30 WLD) + 숙련도 EXP는 100% 전액 지급 (무제한 성장)
    v_base_reward := GREATEST(30::bigint, pg_catalog.round(v_task.base_reward * 0.25 * v_level_mult)::bigint);
    v_exp := pg_catalog.round(v_task.base_experience * v_level_mult);
  ELSE
    -- 기본 정규 일일 업무: 100% WLD + EXP 보상 지급
    v_base_reward := pg_catalog.round(v_task.base_reward * v_level_mult);
    v_exp := pg_catalog.round(v_task.base_experience * v_level_mult);
  END IF;

  -- 5. 일간/주간 잔여 캡 적용 (캡 초과 시 잔여분만 지급하거나 0, EXP는 유지)
  v_reward := LEAST(
    v_base_reward,
    GREATEST(v_daily_cap - coalesce(v_day_paid, 0), 0),
    GREATEST(v_weekly_cap - coalesce(v_week_paid, 0), 0)
  );

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
    v_now, p_actor, CASE WHEN v_is_overtime THEN 'overtime career task completion' ELSE 'direct career task completion' END
  );

  INSERT INTO public.work_completion_records (
    assignment_id, submitted_at, quality_score, verifier_result, verifier_detail
  ) VALUES (
    v_assignment, v_now, 100, 'approved', CASE WHEN v_is_overtime THEN 'overtime career task completion' ELSE 'direct career task completion' END
  );

  IF v_reward > 0 THEN
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
        'exp', v_exp,
        'isOvertime', v_is_overtime
      )
    ) INTO v_tx_id;
  END IF;

  -- 6. 일간 및 주간 누적 한도 테이블(work_reward_windows) 즉시 갱신
  IF v_reward > 0 THEN
    UPDATE public.work_reward_windows AS window_row
    SET paid_amount = window_row.paid_amount + v_reward
    WHERE window_row.user_id = p_actor
      AND ((window_row.window_start = v_day AND window_row.window_kind = 'day')
        OR (window_row.window_start = v_week AND window_row.window_kind = 'week'));
  END IF;

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
$function$;

CREATE OR REPLACE FUNCTION public.work_task_board(p_actor uuid)
RETURNS TABLE(
  task_id uuid,
  code text,
  name text,
  description text,
  job_type work_job_type,
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
AS $function$
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

  -- 호출자의 현재 활성 직업 조회
  SELECT progress_row.job_type::text INTO v_active_job
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor AND progress_row.is_active = true
  LIMIT 1;

  RETURN QUERY
  WITH standing AS (
    SELECT
      task_row.id AS id,
      task_row.code AS code,
      task_row.name AS name,
      task_row.description AS description,
      task_row.job_type AS job_type,
      task_row.difficulty AS difficulty,
      task_row.base_reward AS base_reward,
      task_row.base_experience AS base_experience,
      task_row.minimum_duration_seconds AS minimum_duration_seconds,
      task_row.daily_limit AS daily_limit,
      (
        SELECT count(*)
        FROM public.work_assignments AS assignment_row
        WHERE assignment_row.user_id = p_actor
          AND assignment_row.task_id = task_row.id
          AND assignment_row.assigned_at >= v_day_start
      )::integer AS taken_today
    FROM public.work_task_catalog AS task_row
    WHERE task_row.active
  ),
  suggested AS (
    SELECT standing_row.id AS id
    FROM standing AS standing_row
    WHERE standing_row.taken_today < standing_row.daily_limit
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
    standing_row.daily_limit,
    standing_row.taken_today,
    public.work_reward_preview(p_actor, standing_row.id),
    EXISTS (SELECT 1 FROM suggested AS suggested_row WHERE suggested_row.id = standing_row.id)
  FROM standing AS standing_row
  ORDER BY
    -- 1순위: 내 활성 직업 업무를 무조건 최상단 배치
    (v_active_job IS NOT NULL AND standing_row.job_type::text = v_active_job) DESC,
    -- 2순위: 기본 횟수가 남아있는 업무 우선
    (standing_row.taken_today < standing_row.daily_limit) DESC,
    standing_row.difficulty,
    standing_row.base_reward,
    standing_row.code;
END;
$function$;
