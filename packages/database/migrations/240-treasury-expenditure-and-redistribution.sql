-- 240-treasury-expenditure-and-redistribution.sql
-- Update version: v2026.10.01.483
-- P0 TREASURY-REDISTRIBUTION: Authoritative Treasury Redistribution, Citizen Dividends & Grants
-- Enables atomic treasury disbursements, safe reserve guard (30%), citizen dividend payouts, and audit ledger.

BEGIN;

-- 1. Extend system_treasury_ledger tx_type CHECK constraint
ALTER TABLE public.system_treasury_ledger
  DROP CONSTRAINT IF EXISTS system_treasury_ledger_tx_type_check;

ALTER TABLE public.system_treasury_ledger
  ADD CONSTRAINT system_treasury_ledger_tx_type_check
  CHECK (tx_type IN (
    'INJECTION',
    'ABSORPTION_SINK',
    'STOCK_HALT_SETTLEMENT',
    'FEE_RECIRCULATION',
    'EMERGENCY_RESERVE_TRANSFER',
    'CITIZEN_DIVIDEND',
    'COMMUNITY_FUNDING',
    'WELFARE_SUBSIDY',
    'MARKET_STIMULUS',
    'PUBLIC_GRANT'
  ));

-- 2. Create treasury_disbursements table
CREATE TABLE IF NOT EXISTS public.treasury_disbursements (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  disbursement_type text NOT NULL CHECK (disbursement_type IN (
    'CITIZEN_DIVIDEND',
    'COMMUNITY_FUNDING',
    'WELFARE_SUBSIDY',
    'MARKET_STIMULUS',
    'PUBLIC_GRANT'
  )),
  vault_code text NOT NULL DEFAULT 'VAULT_MAIN',
  total_amount_wld text NOT NULL CHECK (total_amount_wld ~ '^\d+$' AND total_amount_wld::numeric > 0),
  beneficiary_count integer NOT NULL DEFAULT 1 CHECK (beneficiary_count >= 1),
  amount_per_beneficiary_wld text CHECK (amount_per_beneficiary_wld ~ '^\d+$'),
  target_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  admin_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  reason text NOT NULL CHECK (char_length(reason) >= 10),
  created_at timestamptz NOT NULL DEFAULT pg_catalog.clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_treasury_disbursements_type ON public.treasury_disbursements(disbursement_type);
CREATE INDEX IF NOT EXISTS idx_treasury_disbursements_created ON public.treasury_disbursements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_treasury_disbursements_admin ON public.treasury_disbursements(admin_id);

-- 3. Procedure: Citizen Dividend Atomic Payout (시민 보편 배당 원자적 일괄 지급)
CREATE OR REPLACE FUNCTION public.treasury_disburse_citizen_dividend(
  p_actor uuid,
  p_amount_per_user_wld text,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_vault_id uuid;
  v_current_bal numeric;
  v_safe_reserve numeric;
  v_max_available numeric;
  v_amount_per_user numeric;
  v_total_amount numeric;
  v_beneficiary_count integer := 0;
  v_disbursement_id uuid;
  v_ledger_id uuid;
  v_target record;
  v_new_bal numeric;
BEGIN
  IF char_length(p_reason) < 10 THEN
    RAISE EXCEPTION '지출 감사 사유는 최소 10자 이상이어야 합니다 (입력값: %자)', char_length(p_reason);
  END IF;

  v_amount_per_user := p_amount_per_user_wld::numeric;
  IF v_amount_per_user <= 0 OR v_amount_per_user > 1000000 THEN
    RAISE EXCEPTION '1인당 배당금은 1 WLD 이상 1,000,000 WLD 이하의 정수여야 합니다';
  END IF;

  -- 1. 권한 검사 (오퍼레이터 이상)
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role) THEN
    RAISE EXCEPTION '국고 재정 환원금 집행은 오퍼레이터 이상의 관리자 권한이 필요합니다';
  END IF;

  -- 2. 국고 금고 잠금 및 잔액 확인
  SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '중앙 국고 금고(VAULT_MAIN)를 찾을 수 없습니다';
  END IF;

  -- 3. 수혜 대상 집계 (USER_CASH 계정을 보유한 활성 시민)
  SELECT count(*) INTO v_beneficiary_count
  FROM public.accounts a
  JOIN public.users u ON u.id = a.owner_user_id
  WHERE a.account_type = 'USER_CASH'::public.account_type
    AND a.status = 'active'::public.account_status
    AND u.status = 'active'::public.user_status;

  IF v_beneficiary_count <= 0 THEN
    RAISE EXCEPTION '배당을 수령할 활성 시민 계정이 존재하지 않습니다';
  END IF;

  v_total_amount := v_beneficiary_count * v_amount_per_user;

  -- 4. 30% 안전 비축금 원칙 검증 (Safe Reserve Ratio 30%)
  v_safe_reserve := floor(v_current_bal * 0.3);
  v_max_available := v_current_bal - v_safe_reserve;

  IF v_total_amount > v_max_available THEN
    RAISE EXCEPTION '국고 최소 30%% 안전 비축금(% WLD) 보호 규정에 의해 최대 지출 가능액(% WLD)을 초과할 수 없습니다 (필요 예산: % WLD, 수혜자: %명)',
      v_safe_reserve, v_max_available, v_total_amount, v_beneficiary_count;
  END IF;

  -- 5. 수혜 대상 전원 지갑 잔액 원자적 가산
  FOR v_target IN
    SELECT a.id AS account_id, a.owner_user_id
    FROM public.accounts a
    JOIN public.users u ON u.id = a.owner_user_id
    WHERE a.account_type = 'USER_CASH'::public.account_type
      AND a.status = 'active'::public.account_status
      AND u.status = 'active'::public.user_status
  LOOP
    UPDATE public.account_balances
    SET available_amount = available_amount + v_amount_per_user,
        updated_at = pg_catalog.clock_timestamp()
    WHERE account_id = v_target.account_id;
  END LOOP;

  -- 6. 국고 금고 잔액 차감
  v_new_bal := v_current_bal - v_total_amount;
  UPDATE public.system_treasury_vaults
  SET balance_wld = v_new_bal::text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = v_vault_id;

  -- 7. 국고 원장(system_treasury_ledger) 불변 기록
  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
  ) VALUES (
    v_vault_id,
    'CITIZEN_DIVIDEND',
    v_total_amount::text,
    p_actor,
    p_reason,
    v_current_bal::text,
    v_new_bal::text
  ) RETURNING id INTO v_ledger_id;

  -- 8. 국고 지출 집행 테이블(treasury_disbursements) 기록
  INSERT INTO public.treasury_disbursements (
    disbursement_type,
    vault_code,
    total_amount_wld,
    beneficiary_count,
    amount_per_beneficiary_wld,
    admin_id,
    reason
  ) VALUES (
    'CITIZEN_DIVIDEND',
    'VAULT_MAIN',
    v_total_amount::text,
    v_beneficiary_count,
    p_amount_per_user_wld,
    p_actor,
    p_reason
  ) RETURNING id INTO v_disbursement_id;

  RETURN jsonb_build_object(
    'success', true,
    'disbursement_id', v_disbursement_id,
    'ledger_id', v_ledger_id,
    'beneficiary_count', v_beneficiary_count,
    'amount_per_beneficiary_wld', p_amount_per_user_wld,
    'total_amount_wld', v_total_amount::text,
    'balance_before', v_current_bal::text,
    'balance_after', v_new_bal::text,
    'safe_reserve_wld', v_safe_reserve::text,
    'created_at', pg_catalog.clock_timestamp()
  );
END;
$$;

-- 4. Procedure: Public Grant / Community / Welfare Disburse (공공 보조금 및 펀딩 개별 지출)
CREATE OR REPLACE FUNCTION public.treasury_disburse_grant(
  p_actor uuid,
  p_target_user_id uuid,
  p_amount_wld text,
  p_disbursement_type text,
  p_reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_vault_id uuid;
  v_current_bal numeric;
  v_safe_reserve numeric;
  v_max_available numeric;
  v_amount numeric;
  v_new_bal numeric;
  v_target_account_id uuid;
  v_disbursement_id uuid;
  v_ledger_id uuid;
BEGIN
  IF char_length(p_reason) < 10 THEN
    RAISE EXCEPTION '지출 감사 사유는 최소 10자 이상이어야 합니다';
  END IF;

  IF p_disbursement_type NOT IN ('COMMUNITY_FUNDING', 'WELFARE_SUBSIDY', 'MARKET_STIMULUS', 'PUBLIC_GRANT') THEN
    RAISE EXCEPTION '올바른 국고 지출 유형을 지정해 주세요';
  END IF;

  v_amount := p_amount_wld::numeric;
  IF v_amount <= 0 THEN
    RAISE EXCEPTION '지출 금액은 0보다 커야 합니다';
  END IF;

  -- 1. 권한 검사
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role) THEN
    RAISE EXCEPTION '국고 재정 지원금 집행은 오퍼레이터 이상의 관리자 권한이 필요합니다';
  END IF;

  -- 2. 국고 금고 잔액 확인 및 잠금
  SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '중앙 국고 금고(VAULT_MAIN)를 찾을 수 없습니다';
  END IF;

  -- 3. 30% 안전 비축금 검증
  v_safe_reserve := floor(v_current_bal * 0.3);
  v_max_available := v_current_bal - v_safe_reserve;

  IF v_amount > v_max_available THEN
    RAISE EXCEPTION '국고 최소 30%% 안전 비축금(% WLD) 보호 규정에 의해 최대 지출 가능액(% WLD)을 초과할 수 없습니다 (요청액: % WLD)',
      v_safe_reserve, v_max_available, v_amount;
  END IF;

  -- 4. 대상 유저 지갑 계정 조회 및 입금 (수혜 유저 지정 시)
  IF p_target_user_id IS NOT NULL THEN
    SELECT a.id INTO v_target_account_id
    FROM public.accounts a
    WHERE a.owner_user_id = p_target_user_id
      AND a.account_type = 'USER_CASH'::public.account_type
      AND a.status = 'active'::public.account_status;

    IF v_target_account_id IS NULL THEN
      RAISE EXCEPTION '수혜 유저의 활성 현금 지갑을 찾을 수 없습니다 (유저 ID: %)', p_target_user_id;
    END IF;

    UPDATE public.account_balances
    SET available_amount = available_amount + v_amount,
        updated_at = pg_catalog.clock_timestamp()
    WHERE account_id = v_target_account_id;
  END IF;

  -- 5. 국고 금고 잔액 차감
  v_new_bal := v_current_bal - v_amount;
  UPDATE public.system_treasury_vaults
  SET balance_wld = v_new_bal::text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = v_vault_id;

  -- 6. 원장 및 집행 증빙 기록
  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
  ) VALUES (
    v_vault_id,
    p_disbursement_type,
    p_amount_wld,
    p_actor,
    p_reason,
    v_current_bal::text,
    v_new_bal::text
  ) RETURNING id INTO v_ledger_id;

  INSERT INTO public.treasury_disbursements (
    disbursement_type,
    vault_code,
    total_amount_wld,
    beneficiary_count,
    amount_per_beneficiary_wld,
    target_user_id,
    admin_id,
    reason
  ) VALUES (
    p_disbursement_type,
    'VAULT_MAIN',
    p_amount_wld,
    1,
    p_amount_wld,
    p_target_user_id,
    p_actor,
    p_reason
  ) RETURNING id INTO v_disbursement_id;

  RETURN jsonb_build_object(
    'success', true,
    'disbursement_id', v_disbursement_id,
    'ledger_id', v_ledger_id,
    'disbursement_type', p_disbursement_type,
    'target_user_id', p_target_user_id,
    'amount_wld', p_amount_wld,
    'balance_before', v_current_bal::text,
    'balance_after', v_new_bal::text,
    'created_at', pg_catalog.clock_timestamp()
  );
END;
$$;

-- 5. Permissions
GRANT SELECT, INSERT ON public.treasury_disbursements TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_citizen_dividend(uuid, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_grant(uuid, uuid, text, text, text) TO moneyverse_app;

COMMIT;
