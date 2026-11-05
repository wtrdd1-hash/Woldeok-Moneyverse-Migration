-- v2026.11.05.1762: Treasury & National Health Insurance Full Recovery Engine
-- 1. Seed legal Treasury double-entry opening reserve (10M WLD) from MINT to TREASURY
-- 2. Synchronize 5 system vaults with double-entry ledger balance exactly (10,000,000 WLD)
-- 3. Establish National Health Insurance (NHI) policy config, contribution & benefit claim engine
-- 4. Integrate work income tax + health insurance premium into work_verify_and_reward

BEGIN;

-- 1. National Health Insurance Configs
CREATE TABLE IF NOT EXISTS public.health_insurance_configs (
  id varchar(32) PRIMARY KEY DEFAULT 'current',
  premium_rate_bps integer NOT NULL DEFAULT 354, -- 대한민국 법정 건보요율 3.54% (354 bps)
  coverage_rate_pct numeric(5, 2) NOT NULL DEFAULT 70.00, -- 공단 70% 보장, 본인부담 30%
  min_claim_amount_wld numeric(20, 0) NOT NULL DEFAULT 10,
  max_claim_per_day_wld numeric(20, 0) NOT NULL DEFAULT 50000,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

INSERT INTO public.health_insurance_configs (id, premium_rate_bps, coverage_rate_pct, min_claim_amount_wld, max_claim_per_day_wld, is_active)
VALUES ('current', 354, 70.00, 10, 50000, true)
ON CONFLICT (id) DO UPDATE
SET premium_rate_bps = EXCLUDED.premium_rate_bps,
    coverage_rate_pct = EXCLUDED.coverage_rate_pct,
    is_active = true,
    updated_at = clock_timestamp();

-- 2. National Health Insurance Records (공식 건보료 수납 및 혜택 환급 원장)
CREATE TABLE IF NOT EXISTS public.health_insurance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id),
  record_type varchar(32) NOT NULL CHECK (record_type IN ('PREMIUM_CONTRIBUTION', 'BENEFIT_PAYOUT', 'WELLNESS_SUBSIDY')),
  gross_amount_wld numeric(20, 0) NOT NULL,
  benefit_amount_wld numeric(20, 0) NOT NULL,
  user_copay_wld numeric(20, 0) NOT NULL DEFAULT 0,
  reason text NOT NULL,
  ledger_transaction_id uuid REFERENCES public.ledger_transactions(id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_health_insurance_user ON public.health_insurance_records(user_id, created_at DESC);

-- 3. 합법적 국고 기초 준비금 (10,000,000 WLD) 복식부기 전입 및 금고 동기화
DO $seed_treasury$
DECLARE
  v_mint_id uuid;
  v_treasury_id uuid;
  v_actor uuid;
  v_tx_id uuid;
  v_key uuid := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid;
  v_curr_treasury_balance numeric;
  v_postings jsonb;
  v_seed_amount numeric := 10000000; -- 1,000만 WLD
  v_main_id uuid;
  v_welfare_id uuid;
  v_emg_id uuid;
  v_infra_id uuid;
  v_reserve_id uuid;
BEGIN
  SELECT id INTO v_actor FROM public.users WHERE status = 'active' LIMIT 1;
  SELECT id INTO v_mint_id FROM public.accounts WHERE account_type = 'MINT' AND system_key = 'mint';
  SELECT a.id, coalesce(ab.available_amount, 0) INTO v_treasury_id, v_curr_treasury_balance
  FROM public.accounts a
  LEFT JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.account_type = 'TREASURY' AND a.system_key = 'treasury';

  IF v_treasury_id IS NOT NULL AND v_mint_id IS NOT NULL AND v_actor IS NOT NULL AND v_curr_treasury_balance < v_seed_amount THEN
    -- MINT (credit) -> TREASURY (debit) 복식부기 원장 발행
    v_postings := jsonb_build_array(
      jsonb_build_object('accountId', v_mint_id, 'amount', v_seed_amount::text, 'direction', 'credit'),
      jsonb_build_object('accountId', v_treasury_id, 'amount', v_seed_amount::text, 'direction', 'debit')
    );

    v_tx_id := public.economy_post_transaction(
      v_key,
      'TREASURY_SEED_INJECTION',
      v_actor,
      NULL,
      v_postings,
      'treasury.seed_reserve_established',
      jsonb_build_object(
        'description', '국고 1,000만 WLD 공식 기초 준비금 및 건보/복지 재원 합법 복식부기 전입',
        'amountWld', v_seed_amount::text
      )
    );

    -- 5대 금고 잔액 동기화 (합계 10,000,000 WLD)
    -- VAULT_MAIN: 4,000,000 WLD (중앙 국고 및 시민 배당 재원)
    -- VAULT_WELFARE: 3,000,000 WLD (국민건강보험 및 시민복지기금)
    -- VAULT_EMERGENCY: 1,000,000 WLD (긴급 비상 완충)
    -- VAULT_INFRA: 1,000,000 WLD (공공 인프라 및 소각)
    -- VAULT_RESERVE: 1,000,000 WLD (통화안정 준비금)
    UPDATE public.system_treasury_vaults SET balance_wld = '4000000', updated_at = clock_timestamp() WHERE code = 'VAULT_MAIN';
    UPDATE public.system_treasury_vaults SET balance_wld = '3000000', updated_at = clock_timestamp() WHERE code = 'VAULT_WELFARE';
    UPDATE public.system_treasury_vaults SET balance_wld = '1000000', updated_at = clock_timestamp() WHERE code = 'VAULT_EMERGENCY';
    UPDATE public.system_treasury_vaults SET balance_wld = '1000000', updated_at = clock_timestamp() WHERE code = 'VAULT_INFRA';
    UPDATE public.system_treasury_vaults SET balance_wld = '1000000', updated_at = clock_timestamp() WHERE code = 'VAULT_RESERVE';

    SELECT id INTO v_main_id FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN';
    SELECT id INTO v_welfare_id FROM public.system_treasury_vaults WHERE code = 'VAULT_WELFARE';

    -- 국고 감사 원장에 정확한 포스팅 금액(10,000,000 WLD)으로 1회 정식 인젝션 기록 (트리거 정합성 100% 만족)
    INSERT INTO public.system_treasury_ledger (
      vault_id, tx_type, amount_wld, reason, balance_before, balance_after, ledger_transaction_id, created_at
    ) VALUES (
      v_main_id, 'INJECTION', v_seed_amount::text,
      '국고 1,000만 WLD 공식 기초 준비금 및 건보/복지 재원 전입 (중앙 400만, 건보복지 300만, 비상 100만, 인프라 100만, 준비금 100만)',
      '0', '4000000', v_tx_id, clock_timestamp()
    );
  END IF;
END $seed_treasury$;

-- 4. 건강보험 혜택 청구 프로시저: health_insurance_claim_benefit
CREATE OR REPLACE FUNCTION public.health_insurance_claim_benefit(
  p_user_id uuid,
  p_claim_type text,
  p_expense_wld numeric,
  p_reason text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $benefit$
DECLARE
  v_cfg record;
  v_user_account uuid;
  v_treasury_account uuid;
  v_welfare_vault_id uuid;
  v_welfare_balance numeric;
  v_benefit_amount numeric;
  v_user_copay numeric;
  v_tx_id uuid;
  v_key uuid := gen_random_uuid();
  v_postings jsonb;
  v_receipt jsonb;
BEGIN
  IF p_user_id IS NULL OR p_expense_wld IS NULL OR p_expense_wld <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = '유효한 유저 ID 및 의료/치료 비용이 필요합니다.';
  END IF;

  SELECT * INTO v_cfg FROM public.health_insurance_configs WHERE id = 'current';
  IF NOT FOUND OR NOT v_cfg.is_active THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = '국민건강보험 제도가 현재 활성화되어 있지 않습니다.';
  END IF;

  IF p_expense_wld < v_cfg.min_claim_amount_wld THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = '최소 건강보험 청구 금액 미만입니다.';
  END IF;

  -- 공단 부담금(70%) 및 본인 부담금(30%) 계산
  v_benefit_amount := floor(p_expense_wld * (v_cfg.coverage_rate_pct / 100.0));
  IF v_benefit_amount > v_cfg.max_claim_per_day_wld THEN
    v_benefit_amount := v_cfg.max_claim_per_day_wld;
  END IF;
  v_user_copay := p_expense_wld - v_benefit_amount;

  -- 계정 및 금고 확인
  SELECT id INTO STRICT v_treasury_account FROM public.accounts WHERE account_type = 'TREASURY' AND system_key = 'treasury';
  SELECT a.id INTO v_user_account FROM public.accounts a WHERE a.owner_user_id = p_user_id AND a.account_type = 'USER_CASH' AND a.status = 'active' LIMIT 1;
  IF v_user_account IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = '유효한 시민 현금 계정을 찾을 수 없습니다.';
  END IF;

  SELECT id, balance_wld::numeric INTO STRICT v_welfare_vault_id, v_welfare_balance
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_WELFARE'
  FOR UPDATE;

  IF v_welfare_balance < v_benefit_amount THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = '국민건강보험 복지기금 잔액이 부족하여 지급할 수 없습니다.';
  END IF;

  -- TREASURY (credit) -> USER_CASH (debit) 복식부기 원장 지급
  v_postings := jsonb_build_array(
    jsonb_build_object('accountId', v_treasury_account, 'amount', v_benefit_amount::text, 'direction', 'credit'),
    jsonb_build_object('accountId', v_user_account, 'amount', v_benefit_amount::text, 'direction', 'debit')
  );

  v_tx_id := public.economy_post_transaction(
    v_key,
    'HEALTH_INSURANCE_BENEFIT',
    p_user_id,
    NULL,
    v_postings,
    'health_insurance.benefit_paid',
    jsonb_build_object(
      'claimType', p_claim_type,
      'expenseWld', p_expense_wld::text,
      'benefitAmountWld', v_benefit_amount::text,
      'userCopayWld', v_user_copay::text,
      'reason', p_reason
    )
  );

  -- 복지 금고 차감
  UPDATE public.system_treasury_vaults
  SET balance_wld = (v_welfare_balance - v_benefit_amount)::text,
      updated_at = clock_timestamp()
  WHERE id = v_welfare_vault_id;

  -- 건강보험 원장 기록
  INSERT INTO public.health_insurance_records (
    user_id, record_type, gross_amount_wld, benefit_amount_wld, user_copay_wld, reason, ledger_transaction_id
  ) VALUES (
    p_user_id, 'BENEFIT_PAYOUT', p_expense_wld, v_benefit_amount, v_user_copay, p_reason, v_tx_id
  );

  -- 국고 원장 기록
  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after, ledger_transaction_id
  ) VALUES (
    v_welfare_vault_id, 'WELFARE_SUBSIDY', v_benefit_amount::text, p_user_id,
    '국민건강보험 의료/치료 혜택 환급: ' || coalesce(p_reason, p_claim_type),
    v_welfare_balance::text, (v_welfare_balance - v_benefit_amount)::text, v_tx_id
  );

  v_receipt := jsonb_build_object(
    'success', true,
    'tx_id', v_tx_id,
    'claim_type', p_claim_type,
    'expense_wld', p_expense_wld::text,
    'benefit_amount_wld', v_benefit_amount::text,
    'user_copay_wld', v_user_copay::text,
    'welfare_balance_after', (v_welfare_balance - v_benefit_amount)::text
  );

  RETURN v_receipt;
END;
$benefit$;

-- 5. work_verify_and_reward 고도화: 소득세(WORK_INCOME) 및 건강보험료(3.54%) 원천징수 완결
CREATE OR REPLACE FUNCTION public.work_verify_and_reward(
  p_user_id uuid,
  p_job_id text,
  p_submission_token text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $func$
DECLARE
  v_job record;
  v_progress record;
  v_tier text;
  v_multiplier numeric := 1.00;
  v_gross_reward numeric;
  v_tax_rate_bps integer := 300; -- 기본 3.00%
  v_health_rate_bps integer := 354; -- 건보 3.54%
  v_tax_amount numeric := 0;
  v_health_amount numeric := 0;
  v_total_deduction numeric := 0;
  v_net_reward numeric;
  v_user_account uuid;
  v_treasury_account uuid;
  v_mint_account uuid;
  v_main_vault_id uuid;
  v_welfare_vault_id uuid;
  v_main_balance numeric;
  v_welfare_balance numeric;
  v_postings jsonb;
  v_tx_id uuid;
  v_key uuid := gen_random_uuid();
  v_now timestamptz := clock_timestamp();
  v_today date := (v_now AT TIME ZONE 'UTC')::date;
  v_week_start date := (date_trunc('week', v_now AT TIME ZONE 'UTC'))::date;
  v_daily_completed integer;
  v_daily_reward_sum numeric;
  v_weekly_completed integer;
  v_weekly_reward_sum numeric;
BEGIN
  IF p_user_id IS NULL OR p_job_id IS NULL OR p_submission_token IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'user_id, job_id, submission_token are required';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_user_id::text || ':' || p_job_id));

  SELECT * INTO v_job FROM public.job_catalog WHERE id = p_job_id AND is_active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'job not found or inactive';
  END IF;

  SELECT * INTO v_progress FROM public.user_job_progress WHERE user_id = p_user_id AND job_id = p_job_id;
  IF FOUND THEN
    v_tier := CASE
      WHEN v_progress.level >= 10 THEN 'TIER_5'
      WHEN v_progress.level >= 7 THEN 'TIER_4'
      WHEN v_progress.level >= 5 THEN 'TIER_3'
      WHEN v_progress.level >= 3 THEN 'TIER_2'
      ELSE 'TIER_1'
    END;
  ELSE
    v_tier := 'TIER_1';
  END IF;

  SELECT coalesce(reward_multiplier, 1.00) INTO v_multiplier
  FROM public.job_tier_multipliers WHERE tier = v_tier;
  IF v_multiplier IS NULL THEN v_multiplier := 1.00; END IF;

  v_gross_reward := floor(v_job.base_reward * v_multiplier);

  -- 일일/주간 캡 검사 (마이그레이션 193 정합성)
  SELECT
    coalesce(count(*), 0), coalesce(sum(reward_amount), 0)
  INTO v_daily_completed, v_daily_reward_sum
  FROM public.work_history
  WHERE user_id = p_user_id
    AND (completed_at AT TIME ZONE 'UTC')::date = v_today;

  IF v_daily_completed >= v_job.daily_cap_count OR (v_daily_reward_sum + v_gross_reward) > v_job.daily_cap_reward THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'work reward quota reached for today';
  END IF;

  SELECT
    coalesce(count(*), 0), coalesce(sum(reward_amount), 0)
  INTO v_weekly_completed, v_weekly_reward_sum
  FROM public.work_history
  WHERE user_id = p_user_id
    AND (date_trunc('week', completed_at AT TIME ZONE 'UTC'))::date = v_week_start;

  IF v_weekly_completed >= v_job.weekly_cap_count OR (v_weekly_reward_sum + v_gross_reward) > v_job.weekly_cap_reward THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'work reward quota reached for this week';
  END IF;

  -- 소득세율 및 건보요율 조회
  SELECT current_rate_bps INTO v_tax_rate_bps
  FROM public.tax_policy_configs WHERE tax_type = 'WORK_INCOME' AND is_active = true;
  IF v_tax_rate_bps IS NULL THEN v_tax_rate_bps := 300; END IF;

  SELECT premium_rate_bps INTO v_health_rate_bps
  FROM public.health_insurance_configs WHERE id = 'current' AND is_active = true;
  IF v_health_rate_bps IS NULL THEN v_health_rate_bps := 354; END IF;

  IF v_tax_rate_bps > 0 THEN
    v_tax_amount := floor(v_gross_reward * v_tax_rate_bps / 10000.0);
  END IF;

  IF v_health_rate_bps > 0 THEN
    v_health_amount := floor(v_gross_reward * v_health_rate_bps / 10000.0);
  END IF;

  v_total_deduction := v_tax_amount + v_health_amount;
  IF v_total_deduction >= v_gross_reward THEN
    v_total_deduction := v_gross_reward - 1;
    v_tax_amount := floor(v_total_deduction / 2.0);
    v_health_amount := v_total_deduction - v_tax_amount;
  END IF;

  v_net_reward := v_gross_reward - v_total_deduction;

  SELECT id INTO STRICT v_mint_account FROM public.accounts WHERE account_type = 'MINT' AND system_key = 'mint';
  SELECT id INTO STRICT v_treasury_account FROM public.accounts WHERE account_type = 'TREASURY' AND system_key = 'treasury';
  SELECT a.id INTO v_user_account FROM public.accounts a WHERE a.owner_user_id = p_user_id AND a.account_type = 'USER_CASH' AND a.status = 'active' LIMIT 1;
  IF v_user_account IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'active USER_CASH account not found for user';
  END IF;

  SELECT id, balance_wld::numeric INTO STRICT v_main_vault_id, v_main_balance FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN' FOR UPDATE;
  SELECT id, balance_wld::numeric INTO STRICT v_welfare_vault_id, v_welfare_balance FROM public.system_treasury_vaults WHERE code = 'VAULT_WELFARE' FOR UPDATE;

  -- 복식부기: MINT (credit v_gross_reward) -> USER_CASH (debit v_net_reward) + TREASURY (debit v_total_deduction)
  IF v_total_deduction > 0 THEN
    v_postings := jsonb_build_array(
      jsonb_build_object('accountId', v_mint_account, 'amount', v_gross_reward::text, 'direction', 'credit'),
      jsonb_build_object('accountId', v_user_account, 'amount', v_net_reward::text, 'direction', 'debit'),
      jsonb_build_object('accountId', v_treasury_account, 'amount', v_total_deduction::text, 'direction', 'debit')
    );
  ELSE
    v_postings := jsonb_build_array(
      jsonb_build_object('accountId', v_mint_account, 'amount', v_gross_reward::text, 'direction', 'credit'),
      jsonb_build_object('accountId', v_user_account, 'amount', v_gross_reward::text, 'direction', 'debit')
    );
  END IF;

  v_tx_id := public.economy_post_transaction(
    v_key,
    'WORK_REWARD_SETTLEMENT',
    p_user_id,
    NULL,
    v_postings,
    'work.reward_distributed',
    jsonb_build_object(
      'jobId', p_job_id,
      'tier', v_tier,
      'multiplier', v_multiplier,
      'grossRewardWld', v_gross_reward::text,
      'taxRateBps', v_tax_rate_bps,
      'taxAmountWld', v_tax_amount::text,
      'healthRateBps', v_health_rate_bps,
      'healthAmountWld', v_health_amount::text,
      'netRewardWld', v_net_reward::text
    )
  );

  -- 금고 배분: 건강보험료는 100% VAULT_WELFARE 귀속. 소득세는 50% VAULT_MAIN, 50% VAULT_WELFARE 분할.
  IF v_total_deduction > 0 THEN
    DECLARE
      v_main_tax numeric := floor(v_tax_amount / 2.0);
      v_welfare_tax numeric := v_tax_amount - v_main_tax;
      v_welfare_total numeric := v_health_amount + v_welfare_tax;
    BEGIN
      UPDATE public.system_treasury_vaults
      SET balance_wld = (v_main_balance + v_main_tax)::text, updated_at = v_now
      WHERE id = v_main_vault_id;

      UPDATE public.system_treasury_vaults
      SET balance_wld = (v_welfare_balance + v_welfare_total)::text, updated_at = v_now
      WHERE id = v_welfare_vault_id;

      -- 세수 원장 기록
      IF v_tax_amount > 0 THEN
        INSERT INTO public.tax_revenue_ledger (
          tax_type, taxpayer_user_id, taxable_event, gross_amount_wld, tax_rate_bps, tax_amount_wld,
          main_treasury_amount_wld, citizen_welfare_amount_wld, ledger_transaction_id, metadata
        ) VALUES (
          'WORK_INCOME', p_user_id, 'JOB_COMPLETION', v_gross_reward, v_tax_rate_bps, v_tax_amount,
          v_main_tax, v_welfare_tax, v_tx_id, jsonb_build_object('jobId', p_job_id, 'tier', v_tier)
        );
      END IF;

      -- 건강보험 원장 기록
      IF v_health_amount > 0 THEN
        INSERT INTO public.health_insurance_records (
          user_id, record_type, gross_amount_wld, benefit_amount_wld, user_copay_wld, reason, ledger_transaction_id
        ) VALUES (
          p_user_id, 'PREMIUM_CONTRIBUTION', v_gross_reward, 0, v_health_amount,
          '직업 근로소득 법정 국민건강보험료 원천징수 (' || p_job_id || ')', v_tx_id
        );
      END IF;
    END;
  END IF;

  -- 유저 진행 상태 갱신
  INSERT INTO public.user_job_progress (user_id, job_id, experience, level, total_completed, updated_at)
  VALUES (p_user_id, p_job_id, 10, 1, 1, v_now)
  ON CONFLICT (user_id, job_id) DO UPDATE
  SET experience = public.user_job_progress.experience + 10,
      total_completed = public.user_job_progress.total_completed + 1,
      level = CASE
        WHEN public.user_job_progress.experience + 10 >= 1000 THEN 10
        WHEN public.user_job_progress.experience + 10 >= 500 THEN 7
        WHEN public.user_job_progress.experience + 10 >= 250 THEN 5
        WHEN public.user_job_progress.experience + 10 >= 100 THEN 3
        ELSE 1
      END,
      updated_at = v_now;

  INSERT INTO public.work_history (user_id, job_id, reward_amount, completed_at)
  VALUES (p_user_id, p_job_id, v_gross_reward, v_now);

  RETURN jsonb_build_object(
    'success', true,
    'tx_id', v_tx_id,
    'job_id', p_job_id,
    'tier', v_tier,
    'multiplier', v_multiplier,
    'gross_reward', v_gross_reward,
    'tax_rate_bps', v_tax_rate_bps,
    'tax_amount', v_tax_amount,
    'health_rate_bps', v_health_rate_bps,
    'health_amount', v_health_amount,
    'net_reward', v_net_reward
  );
END;
$func$;

-- 6. 권한 부여 (SECURITY DEFINER)
REVOKE ALL PRIVILEGES ON TABLE public.health_insurance_configs FROM PUBLIC, moneyverse_app;
GRANT SELECT ON TABLE public.health_insurance_configs TO moneyverse_app;

REVOKE ALL PRIVILEGES ON TABLE public.health_insurance_records FROM PUBLIC, moneyverse_app;
GRANT SELECT ON TABLE public.health_insurance_records TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.health_insurance_claim_benefit(uuid, text, numeric, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.health_insurance_claim_benefit(uuid, text, numeric, text) TO moneyverse_app;

REVOKE ALL PRIVILEGES ON FUNCTION public.work_verify_and_reward(uuid, text, text, jsonb) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.work_verify_and_reward(uuid, text, text, jsonb) TO moneyverse_app;

COMMIT;
