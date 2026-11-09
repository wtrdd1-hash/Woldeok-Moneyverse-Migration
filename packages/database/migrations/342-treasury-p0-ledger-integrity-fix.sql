-- ============================================================================
-- Migration 342: Treasury & Public Services P0 Canonical Double-Entry Integrity
--
-- 1. Establishes SOE holding escrow account for legitimate corporate dividends.
-- 2. Normalizes admin_pension_distribute_hourly_payouts to disburse payouts
--    via canonical economy_post_transaction (credit TREASURY, debit USER_CASH)
--    instead of direct account_balances mutations.
-- 3. Normalizes admin_soe_harvest_dividends_to_vault to transfer from soe_holding
--    rather than generating unbacked currency via MINT, with deterministic hourly keys.
-- 4. Normalizes treasury_disburse_grant_v2 to disburse grants via canonical
--    economy_post_transaction and record true ledger_transactions.id.
-- ============================================================================

INSERT INTO public.accounts (id, account_type, currency, status, allow_negative, system_key)
VALUES ('e7700000-0000-4000-8000-000000000001'::uuid, 'ESCROW'::public.account_type, 'WLD', 'active'::public.account_status, true, 'soe_holding')
ON CONFLICT (system_key) DO NOTHING;

INSERT INTO public.account_balances (account_id, available_amount)
VALUES ('e7700000-0000-4000-8000-000000000001'::uuid, 0)
ON CONFLICT (account_id) DO NOTHING;

-- 1. 국민연금 정기 기초연금 시간당 일괄 지급 프로시저 (복식부기 전표 발행 정규화)
CREATE OR REPLACE FUNCTION public.admin_pension_distribute_hourly_payouts(p_actor uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_vault_id uuid;
  v_vault_before numeric;
  v_vault_after numeric;
  v_vault_str text;
  v_treasury_acc_id uuid;
  v_pensioner_record RECORD;
  v_pensioners_count integer := 0;
  v_total_payout numeric := 0;
  v_hourly_payout numeric;
  v_user_acc_id uuid;
  v_rate_bps integer;
  v_key uuid;
  v_postings jsonb;
  v_tx_id uuid;
BEGIN
  -- 1. 관리자 권한 확인 (fail-closed)
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'approver'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator pension distribution denied: unauthorized actor';
  END IF;

  -- 2. 중앙 국고 금고(VAULT_MAIN) 및 복식부기 계정(TREASURY) 식별 및 잠금
  SELECT id, balance_wld::numeric, balance_wld INTO v_vault_id, v_vault_before, v_vault_str
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF v_vault_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'VAULT_NOT_FOUND: VAULT_MAIN does not exist';
  END IF;

  SELECT id INTO v_treasury_acc_id
  FROM public.accounts
  WHERE account_type = 'TREASURY'::public.account_type
  LIMIT 1;

  IF v_treasury_acc_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ACCOUNT_NOT_FOUND: TREASURY account does not exist';
  END IF;

  -- 3. 은퇴 연금 수령 대상자 집계
  SELECT count(*) INTO v_pensioners_count
  FROM public.national_pension_accounts
  WHERE status = 'RETIRED_RECEIVING' AND accumulated_contribution_wld > 0;

  IF v_pensioners_count = 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'code', 'PENSION_PAYOUT_NO_RECIPIENTS',
      'message', '현재 은퇴 연금 수령 대상자가 없습니다.',
      'payouts_count', 0,
      'total_payout_wld', '0',
      'vault_balance_after_wld', v_vault_str
    );
  END IF;

  -- 4. 대상자별 지급액 계산 및 합계 산출
  FOR v_pensioner_record IN
    SELECT id, user_id, accumulated_contribution_wld, COALESCE(hourly_payout_rate_bps, 8) as rate_bps
    FROM public.national_pension_accounts
    WHERE status = 'RETIRED_RECEIVING' AND accumulated_contribution_wld > 0
    FOR UPDATE
  LOOP
    v_rate_bps := v_pensioner_record.rate_bps;
    IF v_rate_bps < 1 THEN
      v_rate_bps := 8;
    END IF;

    v_hourly_payout := GREATEST(1, floor(v_pensioner_record.accumulated_contribution_wld * v_rate_bps::numeric / 10000));
    v_total_payout := v_total_payout + v_hourly_payout;
  END LOOP;

  -- 5. 국고 가용 잔액 검증
  IF v_vault_before < v_total_payout THEN
    RAISE EXCEPTION USING ERRCODE = '22003', MESSAGE = 'INSUFFICIENT_FUNDS: VAULT_MAIN balance insufficient';
  END IF;

  -- 6. 국고 중앙 금고(VAULT_MAIN) 차감
  v_vault_after := v_vault_before - v_total_payout;
  UPDATE public.system_treasury_vaults
  SET balance_wld = v_vault_after::text, updated_at = clock_timestamp()
  WHERE id = v_vault_id;

  -- 7. 국고 회계 감사 원장(system_treasury_ledger) 기록
  INSERT INTO public.system_treasury_ledger (
    vault_id,
    tx_type,
    amount_wld,
    actor_id,
    reason,
    balance_before,
    balance_after,
    created_at
  ) VALUES (
    v_vault_id,
    'OUTFLOW',
    v_total_payout::text,
    p_actor,
    '[국민연금] 기초연금 정기 시간당 일괄 지급',
    v_vault_before::text,
    v_vault_after::text,
    clock_timestamp()
  );

  -- 8. 각 은퇴자 유저 계정(USER_CASH) 입금 및 복식부기 전표 발행
  FOR v_pensioner_record IN
    SELECT id, user_id, accumulated_contribution_wld, COALESCE(hourly_payout_rate_bps, 8) as rate_bps
    FROM public.national_pension_accounts
    WHERE status = 'RETIRED_RECEIVING' AND accumulated_contribution_wld > 0
  LOOP
    v_rate_bps := v_pensioner_record.rate_bps;
    IF v_rate_bps < 1 THEN
      v_rate_bps := 8;
    END IF;
    v_hourly_payout := GREATEST(1, floor(v_pensioner_record.accumulated_contribution_wld * v_rate_bps::numeric / 10000));

    -- 유저 USER_CASH 계좌 조회 또는 생성
    SELECT id INTO v_user_acc_id
    FROM public.accounts
    WHERE owner_user_id = v_pensioner_record.user_id AND account_type = 'USER_CASH'::public.account_type
    LIMIT 1;

    IF v_user_acc_id IS NULL THEN
      INSERT INTO public.accounts (owner_user_id, account_type, currency, status, allow_negative)
      VALUES (v_pensioner_record.user_id, 'USER_CASH'::public.account_type, 'WLD', 'active'::public.account_status, false)
      RETURNING id INTO v_user_acc_id;

      INSERT INTO public.account_balances (account_id, available_amount)
      VALUES (v_user_acc_id, 0)
      ON CONFLICT (account_id) DO NOTHING;
    END IF;

    -- 정본 복식부기 전표 발행 (credit TREASURY, debit USER_CASH)
    v_key := md5('pension-payout-' || v_pensioner_record.id::text || '-' || to_char(clock_timestamp(), 'YYYYMMDDHH24'))::uuid;
    v_postings := jsonb_build_array(
      jsonb_build_object('accountId', v_treasury_acc_id, 'amount', v_hourly_payout::text, 'direction', 'credit'),
      jsonb_build_object('accountId', v_user_acc_id, 'amount', v_hourly_payout::text, 'direction', 'debit')
    );

    v_tx_id := public.economy_post_transaction(
      v_key,
      'PENSION_HOURLY_PAYOUT',
      p_actor,
      'v1776',
      v_postings,
      'pension.hourly_payout_disbursed',
      jsonb_build_object(
        'pensionAccountId', v_pensioner_record.id,
        'userId', v_pensioner_record.user_id,
        'hourlyPayoutWld', v_hourly_payout::text
      )
    );

    -- 연금 계좌 누적 수령액 및 최종 지급 시각 갱신
    UPDATE public.national_pension_accounts
    SET total_payout_received_wld = total_payout_received_wld + v_hourly_payout,
        last_payout_at = clock_timestamp(),
        updated_at = clock_timestamp()
    WHERE id = v_pensioner_record.id;

    -- 연금 지급 영수증 기록
    INSERT INTO public.national_pension_payout_logs (
      account_id,
      user_id,
      payout_amount_wld,
      snapshot_accumulated_wld,
      created_at
    ) VALUES (
      v_pensioner_record.id,
      v_pensioner_record.user_id,
      v_hourly_payout::text,
      v_pensioner_record.accumulated_contribution_wld::text,
      clock_timestamp()
    );
  END LOOP;

  -- 9. 최종 성공 영수증 반환
  RETURN jsonb_build_object(
    'success', true,
    'code', 'PENSION_PAYOUT_DISTRIBUTED',
    'message', '은퇴자 기초연금이 성공적으로 국고 중앙 금고에서 복식부기로 일괄 지급되었습니다.',
    'payouts_count', v_pensioners_count,
    'total_payout_wld', v_total_payout::text,
    'vault_balance_after_wld', v_vault_after::text
  );
END;
$function$;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_pension_distribute_hourly_payouts(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_pension_distribute_hourly_payouts(uuid) TO moneyverse_app;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.admin_pension_distribute_hourly_payouts(uuid) TO postgres';
  END IF;
END $$;

-- 2. 국유공기업 배당금 국고 환원 프로시저 (MINT 통화발행 왜곡 차단 및 기간 멱등성 전표)
CREATE OR REPLACE FUNCTION public.admin_soe_harvest_dividends_to_vault(p_actor uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_soe_holding_id uuid;
  v_treasury_id uuid;
  v_main_id uuid;
  v_total_dividend numeric := 0;
  v_enterprises_count integer := 0;
  v_vault_before text;
  v_vault_after text;
  v_current_vault_numeric numeric;
  v_key uuid;
  v_postings jsonb;
  v_tx_id uuid;
  r RECORD;
  v_soe_div numeric;
BEGIN
  -- 1. 관리자 권한 검증
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'approver'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator SOE dividend harvest denied: unauthorized actor';
  END IF;

  -- 2. 시스템 복식부기 계정 식별 (MINT 배제, soe_holding 과 treasury 간 실물 이전)
  SELECT id INTO v_soe_holding_id FROM public.accounts WHERE account_type = 'ESCROW'::public.account_type AND system_key = 'soe_holding';
  SELECT id INTO v_treasury_id FROM public.accounts WHERE account_type = 'TREASURY'::public.account_type AND system_key = 'treasury';
  SELECT id, balance_wld INTO v_main_id, v_vault_before FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN';

  IF v_soe_holding_id IS NULL OR v_treasury_id IS NULL OR v_main_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'canonical treasury or soe holding accounts unavailable';
  END IF;

  -- 3. 활성 공기업의 총 배당액 사전 계산
  SELECT COALESCE(SUM(round(net_profit_hourly_wld::numeric * dividend_rate_bps::numeric / 10000, 0)), 0),
         COUNT(*)
    INTO v_total_dividend, v_enterprises_count
    FROM public.state_enterprises
   WHERE status = 'ACTIVE' AND dividend_rate_bps > 0;

  IF v_total_dividend <= 0 OR v_enterprises_count = 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'NO_ACTIVE_SOE_DIVIDENDS',
      'message', '수취할 수 있는 활성 공기업 배당액이 없습니다.',
      'total_dividends_collected', '0',
      'enterprises_processed', 0
    );
  END IF;

  -- 4. 불변 복식부기 전표 발행 (soe_holding credit -> TREASURY debit)
  v_key := md5('soe-harvest-dividend-' || to_char(clock_timestamp(), 'YYYYMMDDHH24'))::uuid;
  v_postings := jsonb_build_array(
    jsonb_build_object('accountId', v_soe_holding_id, 'amount', v_total_dividend::text, 'direction', 'credit'),
    jsonb_build_object('accountId', v_treasury_id, 'amount', v_total_dividend::text, 'direction', 'debit')
  );

  v_tx_id := public.economy_post_transaction(
    v_key,
    'SOE_DIVIDEND_HARVEST',
    p_actor,
    'v1776',
    v_postings,
    'treasury.soe_dividend_harvest',
    jsonb_build_object(
      'description', '월덱 국가투자공사(WSHC) 산하 공기업 정기 배당금 국고 귀속 입금',
      'totalDividendsWld', v_total_dividend::text,
      'enterprisesCount', v_enterprises_count
    )
  );

  -- 5. VAULT_MAIN 금고 잔액 증액 동기화
  v_current_vault_numeric := COALESCE(v_vault_before::numeric, 0) + v_total_dividend;
  v_vault_after := v_current_vault_numeric::text;

  UPDATE public.system_treasury_vaults
  SET balance_wld = v_vault_after,
      updated_at = clock_timestamp()
  WHERE code = 'VAULT_MAIN';

  -- 6. 국고 감사 원장(system_treasury_ledger)에 정식 수입 기록
  INSERT INTO public.system_treasury_ledger (
    vault_id,
    tx_type,
    amount_wld,
    actor_id,
    reason,
    balance_before,
    balance_after,
    ledger_transaction_id,
    created_at
  ) VALUES (
    v_main_id,
    'INJECTION',
    v_total_dividend::text,
    p_actor,
    '공기업 정기 배당금 국고(VAULT_MAIN) 환원 입금 (복식부기 전표 ' || v_tx_id::text || ')',
    COALESCE(v_vault_before, '0'),
    v_vault_after,
    v_tx_id,
    clock_timestamp()
  );

  -- 7. 각 공기업별 배당 영수증 기록
  FOR r IN (
    SELECT id, operating_revenue_hourly_wld, net_profit_hourly_wld, dividend_rate_bps, eval_grade
      FROM public.state_enterprises
     WHERE status = 'ACTIVE' AND dividend_rate_bps > 0
  ) LOOP
    v_soe_div := round(r.net_profit_hourly_wld::numeric * r.dividend_rate_bps::numeric / 10000, 0);
    INSERT INTO public.state_enterprise_dividend_logs (
      enterprise_id,
      period_start,
      period_end,
      operating_revenue_wld,
      net_profit_wld,
      dividend_rate_bps,
      dividend_amount_wld,
      state_ownership_pct,
      eval_grade,
      ledger_tx_id,
      created_at
    ) VALUES (
      r.id,
      clock_timestamp() - interval '1 hour',
      clock_timestamp(),
      r.operating_revenue_hourly_wld,
      r.net_profit_hourly_wld,
      r.dividend_rate_bps,
      v_soe_div::text,
      100.0,
      r.eval_grade,
      v_tx_id::text,
      clock_timestamp()
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'code', 'SOE_DIVIDENDS_HARVESTED',
    'message', '활성 국유공기업의 배당금이 국고 중앙 금고로 성공적으로 복식부기 환원되었습니다.',
    'total_dividends_collected', v_total_dividend::text,
    'enterprises_processed', v_enterprises_count,
    'vault_balance_after', v_vault_after,
    'ledger_tx_id', v_tx_id::text
  );
END;
$function$;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_soe_harvest_dividends_to_vault(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_soe_harvest_dividends_to_vault(uuid) TO moneyverse_app;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.admin_soe_harvest_dividends_to_vault(uuid) TO postgres';
  END IF;
END $$;

-- 3. 창업 지원금 승인 및 원자적 국고 지급 프로시저 (복식부기 전표 발행 및 상태 분리)
CREATE OR REPLACE FUNCTION public.treasury_disburse_grant_v2(
  p_actor uuid,
  p_grant_id text,
  p_amount_wld text,
  p_vault_code text DEFAULT 'VAULT_WELFARE'::text,
  p_reason text DEFAULT '창업 지원금 승인 및 원자적 국고 지급'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'public', 'pg_temp'
AS $function$
DECLARE
  v_grant record;
  v_target_user_id uuid;
  v_vault_id uuid;
  v_current_bal numeric;
  v_safe_reserve numeric;
  v_max_available numeric;
  v_amount numeric;
  v_new_bal numeric;
  v_target_account_id uuid;
  v_treasury_account_id uuid;
  v_disbursement_id uuid;
  v_ledger_id uuid;
  v_clawback_deadline timestamptz;
  v_key uuid;
  v_postings jsonb;
  v_ledger_tx_id uuid;
BEGIN
  IF char_length(p_reason) < 5 THEN
    RAISE EXCEPTION '지출 감사 사유는 최소 5자 이상이어야 합니다';
  END IF;

  v_amount := p_amount_wld::numeric;
  IF v_amount <= 0 THEN
    RAISE EXCEPTION '지출 금액은 0보다 커야 합니다';
  END IF;

  -- 1. 관리자 권한 검사
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'operator'::public.admin_role) THEN
    RAISE EXCEPTION '국고 재정 지원금 집행은 오퍼레이터 이상의 관리자 권한이 필요합니다';
  END IF;

  -- 2. 대상 신청서 확인 및 잠금
  SELECT * INTO v_grant
  FROM public.treasury_grants
  WHERE id = p_grant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION '신청서 ID %를 찾을 수 없습니다', p_grant_id;
  END IF;

  IF v_grant.status = 'PAID' THEN
    RAISE EXCEPTION '이미 지급 완료된 신청서입니다 (ID: %)', p_grant_id;
  END IF;

  v_target_user_id := v_grant.user_id::uuid;

  -- 3. 출처 금고 잔액 확인 및 잠금
  SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
  FROM public.system_treasury_vaults
  WHERE code = coalesce(p_vault_code, 'VAULT_WELFARE')
  FOR UPDATE;

  IF NOT FOUND THEN
    SELECT id, balance_wld::numeric INTO v_vault_id, v_current_bal
    FROM public.system_treasury_vaults
    WHERE code = 'VAULT_MAIN'
    FOR UPDATE;
    p_vault_code := 'VAULT_MAIN';
  END IF;

  -- 4. 20% 안전 비축금 검증
  v_safe_reserve := floor(v_current_bal * 0.2);
  v_max_available := v_current_bal - v_safe_reserve;

  IF v_amount > v_max_available THEN
    RAISE EXCEPTION '국고 안전 비축금(% WLD) 보호 규정에 의해 최대 지출 가능액(% WLD)을 초과할 수 없습니다 (요청액: % WLD)',
      v_safe_reserve, v_max_available, v_amount;
  END IF;

  -- 5. 수혜 유저 지갑 계정 조회 및 생성
  SELECT a.id INTO v_target_account_id
  FROM public.accounts a
  WHERE a.owner_user_id = v_target_user_id
    AND a.account_type = 'USER_CASH'::public.account_type
    AND a.status = 'active'::public.account_status;

  IF v_target_account_id IS NULL THEN
    INSERT INTO public.accounts (owner_user_id, account_type, currency, status, allow_negative)
    VALUES (v_target_user_id, 'USER_CASH'::public.account_type, 'WLD', 'active'::public.account_status, false)
    RETURNING id INTO v_target_account_id;

    INSERT INTO public.account_balances (account_id, available_amount)
    VALUES (v_target_account_id, 0)
    ON CONFLICT (account_id) DO NOTHING;
  END IF;

  SELECT id INTO v_treasury_account_id
  FROM public.accounts
  WHERE account_type = 'TREASURY'::public.account_type
  LIMIT 1;

  IF v_treasury_account_id IS NULL THEN
    RAISE EXCEPTION '국고 시스템 계정을 찾을 수 없습니다';
  END IF;

  -- 6. 정본 복식부기 전표 발행 (credit TREASURY, debit USER_CASH)
  v_key := md5('startup-grant-disburse-' || p_grant_id)::uuid;
  v_postings := jsonb_build_array(
    jsonb_build_object('accountId', v_treasury_account_id, 'amount', p_amount_wld, 'direction', 'credit'),
    jsonb_build_object('accountId', v_target_account_id, 'amount', p_amount_wld, 'direction', 'debit')
  );

  v_ledger_tx_id := public.economy_post_transaction(
    v_key,
    'PUBLIC_GRANT',
    p_actor,
    'v1776',
    v_postings,
    'treasury.grant_disbursed',
    jsonb_build_object(
      'grantId', p_grant_id,
      'targetUserId', v_target_user_id,
      'amountWld', p_amount_wld,
      'vaultCode', p_vault_code,
      'businessName', v_grant.business_name
    )
  );

  -- 7. 국고 금고 잔액 차감
  v_new_bal := v_current_bal - v_amount;
  UPDATE public.system_treasury_vaults
  SET balance_wld = v_new_bal::text,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = v_vault_id;

  -- 8. 국고 원장 기록
  INSERT INTO public.system_treasury_ledger (
    vault_id, tx_type, amount_wld, actor_id, reason, balance_before, balance_after, ledger_transaction_id
  ) VALUES (
    v_vault_id,
    'PUBLIC_GRANT',
    p_amount_wld,
    p_actor,
    '[' || v_grant.business_name || '] ' || p_reason,
    v_current_bal::text,
    v_new_bal::text,
    v_ledger_tx_id
  ) RETURNING id INTO v_ledger_id;

  -- 9. 국고 지출 증빙 기록
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
    'PUBLIC_GRANT',
    p_vault_code,
    p_amount_wld,
    1,
    p_amount_wld,
    v_target_user_id,
    p_actor,
    '[' || v_grant.business_name || '] ' || p_reason
  ) RETURNING id INTO v_disbursement_id;

  -- 10. 창업 지원금 테이블 상태 갱신 (PAID 완료 및 불변 전표 UUID 연결)
  v_clawback_deadline := pg_catalog.clock_timestamp() + INTERVAL '14 days';
  UPDATE public.treasury_grants
  SET status = 'PAID',
      approved_amount_wld = v_amount,
      funding_vault = p_vault_code,
      reviewer_id = p_actor::text,
      review_note = p_reason,
      reviewed_at = pg_catalog.clock_timestamp(),
      disbursed_at = pg_catalog.clock_timestamp(),
      ledger_tx_id = v_ledger_tx_id::text,
      clawback_deadline = v_clawback_deadline,
      updated_at = pg_catalog.clock_timestamp()
  WHERE id = p_grant_id;

  RETURN jsonb_build_object(
    'success', true,
    'grant_id', p_grant_id,
    'disbursement_id', v_disbursement_id,
    'ledger_id', v_ledger_id,
    'ledger_tx_id', v_ledger_tx_id::text,
    'vault_code', p_vault_code,
    'target_user_id', v_target_user_id,
    'amount_wld', p_amount_wld,
    'clawback_deadline', v_clawback_deadline,
    'balance_before', v_current_bal::text,
    'balance_after', v_new_bal::text,
    'created_at', pg_catalog.clock_timestamp()
  );
END;
$function$;

REVOKE ALL PRIVILEGES ON FUNCTION public.treasury_disburse_grant_v2(uuid, text, text, text, text) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_disburse_grant_v2(uuid, text, text, text, text) TO moneyverse_app;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.treasury_disburse_grant_v2(uuid, text, text, text, text) TO postgres';
  END IF;
END $$;
