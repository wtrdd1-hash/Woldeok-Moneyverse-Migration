-- 268-targeted-treasury-subsidy-and-donation.sql
-- 저자산 초기 유저 타겟팅 국고 선별 지원금 및 고액 자산가 국고 기부(명예의 전당) 시스템

BEGIN;

-- 1. 기부 명예의 전당 및 기부 내역 테이블 신설
CREATE TABLE IF NOT EXISTS public.treasury_donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount_wld numeric NOT NULL CHECK (amount_wld > 0),
  memo text,
  honor_title text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_treasury_donations_user_id ON public.treasury_donations(user_id);
CREATE INDEX IF NOT EXISTS idx_treasury_donations_created_at ON public.treasury_donations(created_at DESC);

-- 1-1. 국고 원장(system_treasury_ledger) tx_type 체크 제약 조건 확장 (기부 및 선별지원 추가)
ALTER TABLE public.system_treasury_ledger DROP CONSTRAINT IF EXISTS system_treasury_ledger_tx_type_check;
ALTER TABLE public.system_treasury_ledger ADD CONSTRAINT system_treasury_ledger_tx_type_check CHECK ((tx_type = ANY (ARRAY['INJECTION'::text, 'ABSORPTION_SINK'::text, 'STOCK_HALT_SETTLEMENT'::text, 'FEE_RECIRCULATION'::text, 'CITIZEN_DIVIDEND'::text, 'COMMUNITY_FUNDING'::text, 'WELFARE_SUBSIDY'::text, 'MARKET_STIMULUS'::text, 'PUBLIC_GRANT'::text, 'BUDGET_DISTRIBUTION'::text, 'MARKET_BUYBACK_BURN'::text, 'CASINO_PIGOVIAN_TAX'::text, 'STOCK_SPECULATION_TAX'::text, 'WEALTH_TAX_COLLECTION'::text, 'USER_DONATION'::text, 'TARGETED_SUBSIDY'::text])));

-- 2. 저자산 초기 유저 맞춤형 국고 선별 지원금 프로시저
CREATE OR REPLACE FUNCTION public.treasury_disburse_targeted_subsidy(
  p_actor uuid,
  p_amount_per_user_wld text,
  p_max_balance_cutoff_wld text,
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
  v_max_cutoff numeric;
  v_beneficiary_count integer;
  v_total_amount numeric;
  v_new_bal numeric;
  v_disbursement_id uuid;
  v_ledger_id uuid;
  v_target record;
BEGIN
  IF char_length(p_reason) < 10 THEN
    RAISE EXCEPTION '지출 감사 사유는 최소 10자 이상이어야 합니다';
  END IF;

  v_amount_per_user := p_amount_per_user_wld::numeric;
  IF v_amount_per_user <= 0 THEN
    RAISE EXCEPTION '1인당 지원금은 0보다 커야 합니다';
  END IF;

  v_max_cutoff := p_max_balance_cutoff_wld::numeric;
  IF v_max_cutoff <= 0 THEN
    RAISE EXCEPTION '자산 컷오프 임계치는 0보다 커야 합니다';
  END IF;

  -- 1. 권한 검사
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role) THEN
    RAISE EXCEPTION '국고 선별 지원금 집행은 오퍼레이터 이상의 관리자 권한이 필요합니다';
  END IF;

  -- 2. 국고 금고 잔액 확인 및 잠금
  SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '중앙 국고 금고(VAULT_MAIN)를 찾을 수 없습니다';
  END IF;

  -- 3. 수혜 대상 집계 (보유 잔액이 컷오프 이하인 활성 일반 시민만 선별)
  SELECT count(*) INTO v_beneficiary_count
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  JOIN public.users u ON u.id = a.owner_user_id
  WHERE a.account_type = 'USER_CASH'::public.account_type
    AND a.status = 'active'::public.account_status
    AND u.status = 'active'::public.user_status
    AND ab.available_amount <= v_max_cutoff;

  IF v_beneficiary_count <= 0 THEN
    RAISE EXCEPTION '자산 % WLD 이하의 지원 대상 시민이 존재하지 않습니다', v_max_cutoff;
  END IF;

  v_total_amount := v_beneficiary_count * v_amount_per_user;

  -- 4. 30% 안전 비축금 원칙 검증
  v_safe_reserve := floor(v_current_bal * 0.3);
  v_max_available := v_current_bal - v_safe_reserve;

  IF v_total_amount > v_max_available THEN
    RAISE EXCEPTION '국고 최소 30%% 안전 비축금(% WLD) 보호 규정에 의해 최대 지출 가능액(% WLD)을 초과할 수 없습니다 (필요 예산: % WLD, 수혜자: %명)',
      v_safe_reserve, v_max_available, v_total_amount, v_beneficiary_count;
  END IF;

  -- 5. 수혜 대상 지갑 잔액 원자적 가산
  FOR v_target IN
    SELECT a.id AS account_id, a.owner_user_id
    FROM public.accounts a
    JOIN public.account_balances ab ON ab.account_id = a.id
    JOIN public.users u ON u.id = a.owner_user_id
    WHERE a.account_type = 'USER_CASH'::public.account_type
      AND a.status = 'active'::public.account_status
      AND u.status = 'active'::public.user_status
      AND ab.available_amount <= v_max_cutoff
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
    'TARGETED_SUBSIDY',
    v_total_amount::text,
    p_actor,
    format('[저자산 선별지원 / 컷오프 %s WLD] %s', p_max_balance_cutoff_wld, p_reason),
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
    'WELFARE_SUBSIDY',
    'VAULT_MAIN',
    v_total_amount::text,
    v_beneficiary_count,
    p_amount_per_user_wld,
    p_actor,
    format('[선별지원 / 컷오프: %s WLD] %s', p_max_balance_cutoff_wld, p_reason)
  ) RETURNING id INTO v_disbursement_id;

  RETURN jsonb_build_object(
    'success', true,
    'disbursement_id', v_disbursement_id,
    'ledger_id', v_ledger_id,
    'beneficiary_count', v_beneficiary_count,
    'amount_per_beneficiary_wld', p_amount_per_user_wld,
    'max_balance_cutoff_wld', p_max_balance_cutoff_wld,
    'total_amount_wld', v_total_amount::text,
    'balance_before', v_current_bal::text,
    'balance_after', v_new_bal::text,
    'safe_reserve_wld', v_safe_reserve::text,
    'created_at', pg_catalog.clock_timestamp()
  );
END;
$$;

-- 3. 유저 국고 자발적 기부 및 잉여 자금 흡수 프로시저
CREATE OR REPLACE FUNCTION public.treasury_user_donate(
  p_user_id uuid,
  p_amount_wld text,
  p_memo text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_user_account_id uuid;
  v_user_bal numeric;
  v_amount numeric;
  v_vault_id uuid;
  v_vault_bal numeric;
  v_new_vault_bal numeric;
  v_honor_title text;
  v_total_donated numeric;
BEGIN
  v_amount := p_amount_wld::numeric;
  IF v_amount <= 0 THEN
    RAISE EXCEPTION '기부 금액은 1 WLD 이상이어야 합니다';
  END IF;

  -- 유저 계정 확인 및 잠금
  SELECT a.id, ab.available_amount INTO v_user_account_id, v_user_bal
  FROM public.accounts a
  JOIN public.account_balances ab ON ab.account_id = a.id
  WHERE a.owner_user_id = p_user_id
    AND a.account_type = 'USER_CASH'::public.account_type
    AND a.status = 'active'::public.account_status
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '활성 현금 계좌를 찾을 수 없습니다';
  END IF;

  IF v_user_bal < v_amount THEN
    RAISE EXCEPTION '보유 잔액(% WLD)이 기부 요청액(% WLD)보다 부족합니다', v_user_bal, v_amount;
  END IF;

  -- 유저 잔액 차감
  UPDATE public.account_balances
  SET available_amount = available_amount - v_amount,
      updated_at = pg_catalog.clock_timestamp()
  WHERE account_id = v_user_account_id;

  -- 국고 금고 입금
  SELECT id, balance_wld::numeric INTO v_vault_id, v_vault_bal
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '중앙 국고 금고를 찾을 수 없습니다';
  END IF;

  v_new_vault_bal := v_vault_bal + v_amount;
  UPDATE public.system_treasury_vaults
  SET balance_wld = v_new_vault_bal::text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = v_vault_id;

  -- 누적 기부액 확인 후 명예 칭호 산정
  SELECT coalesce(sum(amount_wld), 0) + v_amount INTO v_total_donated
  FROM public.treasury_donations
  WHERE user_id = p_user_id;

  IF v_total_donated >= 50000 THEN
    v_honor_title := '골드 필란트로피스트 (Gold Philanthropist)';
  ELSIF v_total_donated >= 10000 THEN
    v_honor_title := '실버 가디언 (Silver Guardian)';
  ELSIF v_total_donated >= 1000 THEN
    v_honor_title := '브론즈 서포터 (Bronze Supporter)';
  ELSE
    v_honor_title := '시민 기부자 (Citizen Donor)';
  END IF;

  -- 기부 내역 기록
  INSERT INTO public.treasury_donations (
    user_id, amount_wld, memo, honor_title
  ) VALUES (
    p_user_id, v_amount, coalesce(p_memo, '국고 자발적 공공 기부'), v_honor_title
  );

  -- 국고 원장 기록
  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after
  ) VALUES (
    v_vault_id,
    'USER_DONATION',
    v_amount::text,
    p_user_id,
    format('[명예 기부] %s (칭호: %s)', coalesce(p_memo, '공공 기부'), v_honor_title),
    v_vault_bal::text,
    v_new_vault_bal::text
  );

  RETURN jsonb_build_object(
    'success', true,
    'donated_amount_wld', v_amount::text,
    'total_donated_wld', v_total_donated::text,
    'honor_title', v_honor_title,
    'user_balance_after', (v_user_bal - v_amount)::text,
    'vault_balance_after', v_new_vault_bal::text
  );
END;
$$;

-- 4. 권한 부여
GRANT SELECT, INSERT ON public.treasury_donations TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_targeted_subsidy(uuid, text, text, text) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_user_donate(uuid, text, text) TO moneyverse_app;

COMMIT;
