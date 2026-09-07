-- Repair and consolidate the professional work system.
-- Historical assignments, receipts and ledger transactions are preserved.
BEGIN;

-- One proficiency curve everywhere: total EXP 100 -> Lv2, 400 -> Lv3,
-- 900 -> Lv4, ... capped at Lv50.
CREATE OR REPLACE FUNCTION public.job_level_for_experience(p_experience bigint)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT CASE
    WHEN p_experience IS NULL OR p_experience <= 0 THEN 1
    ELSE LEAST(50, (pg_catalog.floor(pg_catalog.sqrt(p_experience::numeric / 100)) + 1)::integer)
  END
$$;
ALTER FUNCTION public.job_level_for_experience(bigint) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.job_level_for_experience(bigint) FROM PUBLIC, moneyverse_app;

-- Repair the one known class of level drift produced by the legacy linear
-- formula. No EXP is removed and no historical receipt is changed.
UPDATE public.user_job_progress
SET level = public.job_level_for_experience(experience),
    changed_at = pg_catalog.clock_timestamp()
WHERE level IS DISTINCT FROM public.job_level_for_experience(experience);

-- Resolve any old multi-active rows by keeping the most recently selected
-- profession, then make the invariant impossible to violate again.
WITH ranked AS (
  SELECT progress_row.user_id,
         progress_row.job_type,
         pg_catalog.row_number() OVER (
           PARTITION BY progress_row.user_id
           ORDER BY progress_row.selected_at DESC NULLS LAST,
                    progress_row.changed_at DESC NULLS LAST,
                    progress_row.job_type::text
         ) AS choice
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.is_active
)
UPDATE public.user_job_progress AS progress_row
SET is_active = false,
    changed_at = pg_catalog.clock_timestamp()
FROM ranked
WHERE ranked.user_id = progress_row.user_id
  AND ranked.job_type = progress_row.job_type
  AND ranked.choice > 1;

CREATE UNIQUE INDEX IF NOT EXISTS ux_user_job_progress_one_active
  ON public.user_job_progress(user_id)
  WHERE is_active;

-- Job 2.0 seeded exactly three tasks per professional career. These two rows
-- are Work 1.0 leftovers whose job enums survived the migration. Keep them for
-- receipt history, but stop offering them as new work.
UPDATE public.work_task_catalog
SET active = false,
    updated_at = pg_catalog.clock_timestamp()
WHERE code IN (
  'logistics_sorting',
  'delivery_run',
  'equipment_inspection',
  'farm_care',
  'mine_survey'
)
  AND active;

-- Switching is intentionally zero-fee/zero-cooldown, but it is serialized per
-- member and refuses inactive/deleted accounts.
CREATE OR REPLACE FUNCTION public.job_switch_active(p_actor uuid, p_job_type text)
RETURNS TABLE(job_type text, level integer, experience bigint, is_active boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_job_enum public.work_job_type;
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS user_row
    WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  BEGIN
    v_job_enum := p_job_type::public.work_job_type;
  EXCEPTION WHEN invalid_text_representation OR null_value_not_allowed THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid job type';
  END;
  IF v_job_enum IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid job type';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('moneyverse:job-switch:' || p_actor::text, 0)
  );

  UPDATE public.user_job_progress AS progress_row
  SET is_active = false,
      changed_at = pg_catalog.clock_timestamp()
  WHERE progress_row.user_id = p_actor
    AND progress_row.is_active;

  INSERT INTO public.user_job_progress (
    user_id, job_type, experience, level, is_active, selected_at, changed_at
  ) VALUES (
    p_actor, v_job_enum, 0, 1, true,
    pg_catalog.clock_timestamp(), pg_catalog.clock_timestamp()
  )
  ON CONFLICT ON CONSTRAINT user_job_progress_pkey DO UPDATE SET
    is_active = true,
    selected_at = pg_catalog.clock_timestamp(),
    changed_at = pg_catalog.clock_timestamp();

  RETURN QUERY
  SELECT progress_row.job_type::text,
         progress_row.level,
         progress_row.experience,
         progress_row.is_active
  FROM public.user_job_progress AS progress_row
  WHERE progress_row.user_id = p_actor
    AND progress_row.job_type = v_job_enum;
END;
$$;
ALTER FUNCTION public.job_switch_active(uuid, text) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.job_switch_active(uuid, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.job_switch_active(uuid, text) TO moneyverse_app;

-- Exact level-aware previews used by both the board and payout functions.
CREATE OR REPLACE FUNCTION public.work_reward_preview(p_actor uuid, p_task uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT pg_catalog.round(
           task_row.base_reward *
           (1.0 + ((COALESCE(progress_row.level, 1) - 1) * 0.05))
         )::bigint
  FROM public.work_task_catalog AS task_row
  LEFT JOIN public.user_job_progress AS progress_row
    ON progress_row.user_id = p_actor
   AND progress_row.job_type = task_row.job_type
  WHERE p_actor IS NOT NULL
    AND task_row.id = p_task
    AND task_row.active
    AND EXISTS (
      SELECT 1 FROM public.users AS user_row
      WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
    )
    AND EXISTS (
      SELECT 1 FROM public.work_reward_policy_versions AS policy_row
      WHERE policy_row.enabled AND policy_row.effective_at <= pg_catalog.clock_timestamp()
    )
$$;
ALTER FUNCTION public.work_reward_preview(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.work_reward_preview(uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_reward_preview(uuid, uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.work_experience_preview(p_actor uuid, p_task uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT pg_catalog.round(
           task_row.base_experience *
           (1.0 + ((COALESCE(progress_row.level, 1) - 1) * 0.05))
         )::bigint
  FROM public.work_task_catalog AS task_row
  LEFT JOIN public.user_job_progress AS progress_row
    ON progress_row.user_id = p_actor
   AND progress_row.job_type = task_row.job_type
  WHERE p_actor IS NOT NULL
    AND task_row.id = p_task
    AND task_row.active
    AND EXISTS (
      SELECT 1 FROM public.users AS user_row
      WHERE user_row.id = p_actor AND user_row.status = 'active'::public.user_status
    )
    AND EXISTS (
      SELECT 1 FROM public.work_reward_policy_versions AS policy_row
      WHERE policy_row.enabled AND policy_row.effective_at <= pg_catalog.clock_timestamp()
    )
$$;
ALTER FUNCTION public.work_experience_preview(uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.work_experience_preview(uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_experience_preview(uuid, uuid) TO moneyverse_app;

-- New assignments can only be taken for the caller's active profession.
CREATE OR REPLACE FUNCTION public.work_assign_task(p_key uuid, p_actor uuid, p_task uuid)
RETURNS TABLE(assignment_id uuid, task_id uuid, assigned_at timestamptz, expires_at timestamptz, replayed boolean)
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
    RAISE EXCEPTION USING ERRCODE = '28000', MESSAGE = 'active member required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.work_task_catalog AS task_row
    WHERE task_row.id = p_task AND task_row.active
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active work task required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.work_task_catalog AS task_row
    JOIN public.user_job_progress AS progress_row
      ON progress_row.user_id = p_actor
     AND progress_row.is_active
     AND progress_row.job_type = task_row.job_type
    WHERE task_row.id = p_task
      AND task_row.active
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'task job type does not match caller active job';
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
ALTER FUNCTION public.work_assign_task(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.work_assign_task(uuid, uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_assign_task(uuid, uuid, uuid) TO moneyverse_app;

-- The board still exposes all careers for exploration, but today's suggestion
-- comes from the active profession. With no selected profession it keeps the
-- original three global suggestions.
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
           (
             SELECT pg_catalog.count(*)
             FROM public.work_assignments AS assignment_row
             WHERE assignment_row.user_id = p_actor
               AND assignment_row.task_id = task_row.id
               AND assignment_row.assigned_at >= v_day_start
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
         0::integer, standing_row.taken_today,
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

CREATE OR REPLACE FUNCTION public.work_complete_task_v2(p_actor uuid, p_task_id uuid, p_idempotency_key uuid)
 RETURNS TABLE(reward_amount bigint, experience_gained bigint, current_level integer, current_experience bigint, level_up boolean, transaction_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
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

  v_is_overtime := false;

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

  -- The board and the ledger share one calculation. If operations disable
  -- work rewards, direct completion refuses rather than silently minting anyway.
  v_base_reward := public.work_reward_preview(p_actor, p_task_id);
  v_exp := public.work_experience_preview(p_actor, p_task_id);
  IF v_base_reward IS NULL OR v_exp IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'work rewards are disabled';
  END IF;
  v_reward := v_base_reward;

  v_new_exp := v_progress.experience + v_exp;
  v_new_level := public.job_level_for_experience(v_new_exp);
  v_level_up := v_new_level > v_progress.level;

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

ALTER FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_complete_task_v2(uuid, uuid, uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.work_verify_and_reward(p_key uuid, p_actor uuid, p_assignment uuid)
 RETURNS TABLE(assignment_id uuid, reward_amount bigint, experience_amount bigint, transaction_id uuid, replayed boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
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

  IF NOT EXISTS (
    SELECT 1
    FROM public.user_job_progress AS progress_row
    JOIN public.work_task_catalog AS task_row ON task_row.job_type = progress_row.job_type
    WHERE progress_row.user_id = p_actor
      AND progress_row.is_active
      AND task_row.id = v_task
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'task job type does not match caller active job';
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

  -- Legacy assignment completion now shares the same full-repeat, level-aware
  -- amount as direct completion. The repeat count remains historical telemetry.
  v_reward := public.work_reward_preview(p_actor, v_task);
  v_xp := public.work_experience_preview(p_actor, v_task);
  IF v_reward IS NULL OR v_xp IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'work rewards are disabled';
  END IF;

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
      level = public.job_level_for_experience(user_job_progress.experience + excluded.experience),
      changed_at = pg_catalog.clock_timestamp();

  assignment_id := p_assignment;
  reward_amount := v_reward;
  experience_amount := v_xp;
  transaction_id := v_transaction;
  replayed := false;
  RETURN NEXT;
END;
$function$;

ALTER FUNCTION public.work_verify_and_reward(uuid, uuid, uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.work_verify_and_reward(uuid, uuid, uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_verify_and_reward(uuid, uuid, uuid) TO moneyverse_app;

-- The hourly fixed wallet faucet predates the career task screen. Stop new
-- generic claims; existing work_rewards rows and ledger history remain intact.
UPDATE public.work_reward_policy
SET enabled = false
WHERE singleton AND enabled;

-- Restate the table boundary touched by the new helper functions.
REVOKE ALL PRIVILEGES ON TABLE
  public.work_task_catalog,
  public.user_job_progress,
  public.work_assignments,
  public.work_reward_receipts,
  public.work_reward_policy_versions
FROM PUBLIC, moneyverse_app;

COMMIT;
