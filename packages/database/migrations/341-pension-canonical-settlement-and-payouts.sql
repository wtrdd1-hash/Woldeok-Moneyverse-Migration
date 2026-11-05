-- ============================================================================
-- Migration 341: National Pension Service (NPS) Canonical Settlement & Payouts
--
-- Replaces unjournaled legacy pension operations with an atomic, certified
-- stored procedure that disburses retirement payouts through the canonical
-- double-entry ledger from VAULT_MAIN into USER_CASH accounts.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_pension_distribute_hourly_payouts(
  p_actor uuid
)
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
  v_pensioner_record RECORD;
  v_pensioners_count integer := 0;
  v_total_payout numeric := 0;
  v_hourly_payout numeric;
  v_user_acc_id uuid;
  v_rate_bps integer;
BEGIN
  -- 1. 관리자 권한 확인 (fail-closed)
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'approver'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator pension distribution denied: unauthorized actor';
  END IF;

  -- 2. 중앙 국고(VAULT_MAIN) 잔액 및 잠금 획득
  SELECT id, balance_wld::numeric, balance_wld INTO v_vault_id, v_vault_before, v_vault_str
  FROM public.system_treasury_vaults
  WHERE code = 'VAULT_MAIN'
  FOR UPDATE;

  IF v_vault_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'VAULT_NOT_FOUND: VAULT_MAIN does not exist';
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

    -- 시간당 지급액: principal * bps / 10000 (최소 1 WLD)
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

  -- 8. 각 은퇴자 유저 계정(USER_CASH) 입금 및 이력 기록
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
    WHERE owner_user_id = v_pensioner_record.user_id AND account_type = 'USER_CASH'
    LIMIT 1;

    IF v_user_acc_id IS NULL THEN
      INSERT INTO public.accounts (owner_user_id, account_type, currency, status, allow_negative)
      VALUES (v_pensioner_record.user_id, 'USER_CASH', 'WLD', 'active', false)
      RETURNING id INTO v_user_acc_id;
    END IF;

    -- 유저 잔액 증액
    INSERT INTO public.account_balances (account_id, available_amount)
    VALUES (v_user_acc_id, v_hourly_payout)
    ON CONFLICT (account_id)
    DO UPDATE SET available_amount = public.account_balances.available_amount + EXCLUDED.available_amount;

    -- 연금 계좌 누적 수령액 및 최종 지급 시각 갱신
    UPDATE public.national_pension_accounts
    SET total_payout_received_wld = total_payout_received_wld + v_hourly_payout,
        last_payout_at = clock_timestamp(),
        updated_at = clock_timestamp()
    WHERE id = v_pensioner_record.id;

    -- 연금 지급 영수증 원자적 기록
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
