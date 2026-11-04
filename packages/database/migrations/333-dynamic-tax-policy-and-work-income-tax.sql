-- 333-dynamic-tax-policy-and-work-income-tax.sql
-- v2026.11.04.1720 — Dynamic Macro-Linked Tax Policy Engine & Work Income Tax System
-- 1. Create tax_policy_configs table
-- 2. Create tax_revenue_ledger table
-- 3. Upgrade work_verify_and_reward function to deduct Work Income Tax and disburse to 국고 (VAULT_MAIN 50%, VAULT_WELFARE 50%)
-- 4. Create admin_update_tax_policy procedure & economy_auto_adjust_tax_rates function

BEGIN;

-- 1. Create tax_policy_configs
CREATE TABLE IF NOT EXISTS public.tax_policy_configs (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  tax_type text NOT NULL UNIQUE CHECK (tax_type IN ('WORK_INCOME', 'MARKETPLACE', 'WEALTH', 'PROPERTY')),
  name text NOT NULL,
  base_rate_bps integer NOT NULL CHECK (base_rate_bps >= 0 AND base_rate_bps <= 5000),
  current_rate_bps integer NOT NULL CHECK (current_rate_bps >= 0 AND current_rate_bps <= 5000),
  min_rate_bps integer NOT NULL DEFAULT 100 CHECK (min_rate_bps >= 0),
  max_rate_bps integer NOT NULL DEFAULT 2500 CHECK (max_rate_bps <= 5000),
  auto_adjust_enabled boolean NOT NULL DEFAULT true,
  tier_multipliers jsonb NOT NULL DEFAULT '{"TIER_1": 0.6, "TIER_2": 0.8, "TIER_3": 1.0, "TIER_4": 1.2, "TIER_5": 1.5}'::jsonb,
  last_adjusted_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp(),
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Seed initial tax policy configs
INSERT INTO public.tax_policy_configs (
  tax_type, name, base_rate_bps, current_rate_bps, min_rate_bps, max_rate_bps, auto_adjust_enabled
) VALUES
  ('WORK_INCOME', '직업 근로 소득세 (Work Income Tax)', 500, 500, 300, 1500, true),
  ('MARKETPLACE', '마켓 거래세 (Marketplace Transaction Tax)', 300, 300, 100, 1000, true),
  ('WEALTH', '고액 자산가 누진 부유세 (Progressive Wealth Tax)', 1000, 1000, 500, 2500, true),
  ('PROPERTY', '부동산 보유세 (Property Holding Tax)', 200, 200, 100, 800, true)
ON CONFLICT (tax_type) DO UPDATE SET
  updated_at = pg_catalog.clock_timestamp();

-- 2. Create tax_revenue_ledger
CREATE TABLE IF NOT EXISTS public.tax_revenue_ledger (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  tax_type text NOT NULL,
  payer_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  gross_amount_wld numeric NOT NULL CHECK (gross_amount_wld > 0),
  tax_amount_wld numeric NOT NULL CHECK (tax_amount_wld >= 0),
  effective_rate_bps integer NOT NULL,
  vault_main_portion_wld numeric NOT NULL DEFAULT 0,
  vault_welfare_portion_wld numeric NOT NULL DEFAULT 0,
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_tax_revenue_ledger_type ON public.tax_revenue_ledger(tax_type);
CREATE INDEX IF NOT EXISTS idx_tax_revenue_ledger_payer ON public.tax_revenue_ledger(payer_user_id);
CREATE INDEX IF NOT EXISTS idx_tax_revenue_ledger_created ON public.tax_revenue_ledger(created_at DESC);

-- 3. Extend work_reward_receipts with tax details
ALTER TABLE public.work_reward_receipts
  ADD COLUMN IF NOT EXISTS gross_reward_amount bigint,
  ADD COLUMN IF NOT EXISTS tax_amount bigint DEFAULT 0;

-- 4. Procedure: admin_update_tax_policy
CREATE OR REPLACE FUNCTION public.admin_update_tax_policy(
  p_admin_id uuid,
  p_tax_type text,
  p_new_base_rate_bps integer,
  p_new_current_rate_bps integer,
  p_auto_adjust boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_row record;
BEGIN
  IF p_admin_id IS NULL OR NOT public.admin_role_holder(p_admin_id, 'operator'::public.admin_role) THEN
    RAISE EXCEPTION '세율 조정은 오퍼레이터 이상의 관리자 권한이 필요합니다';
  END IF;

  IF p_new_base_rate_bps < 0 OR p_new_base_rate_bps > 5000 OR
     p_new_current_rate_bps < 0 OR p_new_current_rate_bps > 5000 THEN
    RAISE EXCEPTION '세율은 0 bps (0%%) 이상 5000 bps (50%%) 이하이어야 합니다';
  END IF;

  UPDATE public.tax_policy_configs
  SET base_rate_bps = p_new_base_rate_bps,
      current_rate_bps = p_new_current_rate_bps,
      auto_adjust_enabled = p_auto_adjust,
      updated_at = pg_catalog.clock_timestamp(),
      updated_by = p_admin_id
  WHERE tax_type = p_tax_type
  RETURNING * INTO v_row;

  IF NOT FOUND THEN
    RAISE EXCEPTION '지정된 세금 유형(%)을 찾을 수 없습니다', p_tax_type;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'tax_type', v_row.tax_type,
    'base_rate_bps', v_row.base_rate_bps,
    'current_rate_bps', v_row.current_rate_bps,
    'auto_adjust_enabled', v_row.auto_adjust_enabled,
    'updated_at', v_row.updated_at
  );
END;
$$;

-- 5. Procedure: economy_auto_adjust_tax_rates
CREATE OR REPLACE FUNCTION public.economy_auto_adjust_tax_rates()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_main_vault_bal numeric := 0;
  v_safe_reserve numeric := 0;
  v_adjusted_count integer := 0;
  v_config record;
  v_new_rate integer;
BEGIN
  SELECT balance_wld::numeric INTO v_main_vault_bal
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN';

  IF v_main_vault_bal IS NULL THEN
    v_main_vault_bal := 0;
  END IF;

  FOR v_config IN
    SELECT * FROM public.tax_policy_configs WHERE auto_adjust_enabled = true
  LOOP
    -- 국고 비축률 및 시장 상황에 따른 가산율 계산
    -- 국고가 풍족할수록(1,000,000 WLD 초과) 기본 세율 유지 또는 인하
    -- 국고가 적을수록(100,000 WLD 미만) 세율을 인상하여 비축금 보충
    IF v_main_vault_bal < 100000 THEN
      v_new_rate := LEAST(v_config.max_rate_bps, v_config.base_rate_bps + 200);
    ELSIF v_main_vault_bal > 10000000 THEN
      v_new_rate := GREATEST(v_config.min_rate_bps, v_config.base_rate_bps - 100);
    ELSE
      v_new_rate := v_config.base_rate_bps;
    END IF;

    UPDATE public.tax_policy_configs
    SET current_rate_bps = v_new_rate,
        last_adjusted_at = pg_catalog.clock_timestamp()
    WHERE id = v_config.id;

    v_adjusted_count := v_adjusted_count + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'adjusted_configs_count', v_adjusted_count,
    'treasury_balance', v_main_vault_bal,
    'adjusted_at', pg_catalog.clock_timestamp()
  );
END;
$$;

-- 6. Upgrade work_verify_and_reward with Work Income Tax & Treasury distribution
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
  v_gross_reward bigint;
  v_net_reward bigint;
  v_tax bigint := 0;
  v_tax_main bigint := 0;
  v_tax_welfare bigint := 0;
  v_effective_rate_bps integer := 500;
  v_tier_mult numeric := 1.0;
  v_job_tier text := 'TIER_1';
  v_xp bigint;
  v_day date := (pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_week date := date_trunc('week', pg_catalog.clock_timestamp() AT TIME ZONE 'Asia/Seoul')::date;
  v_decay smallint;
  v_cash uuid;
  v_mint uuid;
  v_treasury uuid;
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
  INTO v_owner, v_task, v_status, v_gross_reward, v_xp
  FROM public.work_assignments AS assignment_row
  JOIN public.work_task_catalog AS task_row ON task_row.id = assignment_row.task_id
  WHERE assignment_row.id = p_assignment
  FOR UPDATE OF assignment_row;

  IF v_owner IS DISTINCT FROM p_actor OR v_status <> 'submitted' THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'submitted work assignment required';
  END IF;

  -- Verify active job and calculate tier
  SELECT (CASE
    WHEN progress_row.level >= 40 THEN 'TIER_5'
    WHEN progress_row.level >= 30 THEN 'TIER_4'
    WHEN progress_row.level >= 20 THEN 'TIER_3'
    WHEN progress_row.level >= 10 THEN 'TIER_2'
    ELSE 'TIER_1'
  END) INTO v_job_tier
  FROM public.user_job_progress AS progress_row
  JOIN public.work_task_catalog AS task_row ON task_row.job_type = progress_row.job_type
  WHERE progress_row.user_id = p_actor
    AND progress_row.is_active
    AND task_row.id = v_task;

  IF v_job_tier IS NULL THEN
    v_job_tier := 'TIER_1';
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

  v_gross_reward := public.work_reward_preview(p_actor, v_task);
  v_xp := public.work_experience_preview(p_actor, v_task);
  IF v_gross_reward IS NULL OR v_xp IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'work rewards are disabled';
  END IF;

  -- 1. Calculate Work Income Tax (직업 소득세 원천징수 계산)
  SELECT current_rate_bps INTO v_effective_rate_bps
  FROM public.tax_policy_configs
  WHERE tax_type = 'WORK_INCOME';

  IF v_effective_rate_bps IS NULL THEN
    v_effective_rate_bps := 500; -- 기본 5%
  END IF;

  -- Tier multiplier 적용 (Tier 1: 0.6x=3%, Tier 3: 1.0x=5%, Tier 5: 1.5x=7.5% 등)
  IF v_job_tier = 'TIER_1' THEN v_tier_mult := 0.6;
  ELSIF v_job_tier = 'TIER_2' THEN v_tier_mult := 0.8;
  ELSIF v_job_tier = 'TIER_3' THEN v_tier_mult := 1.0;
  ELSIF v_job_tier = 'TIER_4' THEN v_tier_mult := 1.2;
  ELSIF v_job_tier = 'TIER_5' THEN v_tier_mult := 1.5;
  ELSE v_tier_mult := 1.0;
  END IF;

  v_effective_rate_bps := round(v_effective_rate_bps * v_tier_mult)::integer;

  IF v_gross_reward > 0 THEN
    v_tax := round(v_gross_reward * v_effective_rate_bps / 10000.0)::bigint;
    IF v_tax >= v_gross_reward THEN
      v_tax := v_gross_reward - 1;
    END IF;
    v_net_reward := v_gross_reward - v_tax;
    v_tax_main := floor(v_tax * 0.5)::bigint;
    v_tax_welfare := v_tax - v_tax_main;
  ELSE
    v_net_reward := 0;
    v_tax := 0;
  END IF;

  -- Keep recording window statistics
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

  SELECT account_row.id INTO v_treasury
  FROM public.accounts AS account_row
  WHERE account_row.system_key = 'treasury'
    AND account_row.account_type = 'TREASURY'::public.account_type
    AND account_row.status = 'active'::public.account_status
  FOR UPDATE;

  IF v_cash IS NULL OR v_mint IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'active work accounts required';
  END IF;

  -- 2. Post Ledger Transaction (Double-entry)
  -- Case 1: Tax exists -> MINT credits total, USER receives net, TREASURY receives tax
  IF v_gross_reward > 0 THEN
    IF v_tax > 0 AND v_treasury IS NOT NULL THEN
      SELECT public.economy_post_transaction(
        p_key,
        'WORK_TASK_REWARD',
        p_actor,
        NULL,
        pg_catalog.jsonb_build_array(
          pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', v_gross_reward, 'direction', 'credit'),
          pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_net_reward, 'direction', 'debit'),
          pg_catalog.jsonb_build_object('accountId', v_treasury, 'amount', v_tax, 'direction', 'debit')
        ),
        'game.work_task.rewarded_with_tax',
        pg_catalog.jsonb_build_object(
          'assignmentId', p_assignment,
          'grossAmount', v_gross_reward,
          'netAmount', v_net_reward,
          'taxAmount', v_tax,
          'taxRateBps', v_effective_rate_bps,
          'experience', v_xp
        )
      ) INTO v_transaction;

      -- Update system treasury vaults balance
      UPDATE public.system_treasury_vaults
      SET balance_wld = (balance_wld::numeric + v_tax_main)::text,
          updated_at = pg_catalog.clock_timestamp()
      WHERE code = 'VAULT_MAIN';

      UPDATE public.system_treasury_vaults
      SET balance_wld = (balance_wld::numeric + v_tax_welfare)::text,
          updated_at = pg_catalog.clock_timestamp()
      WHERE code = 'VAULT_WELFARE';

      -- Record tax revenue ledger
      INSERT INTO public.tax_revenue_ledger (
        tax_type, payer_user_id, gross_amount_wld, tax_amount_wld, effective_rate_bps,
        vault_main_portion_wld, vault_welfare_portion_wld, reference_id
      ) VALUES (
        'WORK_INCOME', p_actor, v_gross_reward, v_tax, v_effective_rate_bps,
        v_tax_main, v_tax_welfare, p_assignment
      );
    ELSE
      SELECT public.economy_post_transaction(
        p_key,
        'WORK_TASK_REWARD',
        p_actor,
        NULL,
        pg_catalog.jsonb_build_array(
          pg_catalog.jsonb_build_object('accountId', v_mint, 'amount', v_net_reward, 'direction', 'credit'),
          pg_catalog.jsonb_build_object('accountId', v_cash, 'amount', v_net_reward, 'direction', 'debit')
        ),
        'game.work_task.rewarded',
        pg_catalog.jsonb_build_object('assignmentId', p_assignment, 'amount', v_net_reward, 'experience', v_xp)
      ) INTO v_transaction;
    END IF;
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
    idempotency_key, assignment_id, user_id, reward_amount,
    experience_amount, transaction_id, gross_reward_amount, tax_amount
  ) VALUES (
    p_key, p_assignment, p_actor, v_net_reward,
    v_xp, v_transaction, v_gross_reward, v_tax
  );

  UPDATE public.work_reward_windows AS window_row
  SET paid_amount = window_row.paid_amount + v_net_reward
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
  reward_amount := v_net_reward;
  experience_amount := v_xp;
  transaction_id := v_transaction;
  replayed := false;
  RETURN NEXT;
END;
$function$;

GRANT SELECT ON public.tax_policy_configs TO moneyverse_app;
GRANT SELECT ON public.tax_revenue_ledger TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_update_tax_policy(uuid, text, integer, integer, boolean) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.economy_auto_adjust_tax_rates() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_verify_and_reward(uuid, uuid, uuid) TO moneyverse_app;

COMMIT;
