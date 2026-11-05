-- v2026.11.05.1764: SWF Canonical Liquidation & Rebalancing Settlement
-- 1. Implement public.admin_swf_liquidate_to_vault with canonical double-entry ledger postings
-- 2. Liquidate excess AUM stocks into VAULT_MAIN with immutable transaction receipts
-- 3. Grant execution privilege to moneyverse_app

BEGIN;

CREATE OR REPLACE FUNCTION public.admin_swf_liquidate_to_vault(
  p_actor uuid,
  p_target_aum numeric DEFAULT 20000000
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_mint_id uuid;
  v_treasury_id uuid;
  v_main_id uuid;
  v_total_aum numeric;
  v_liquidate_amount numeric;
  v_actual_liquidated numeric;
  v_ratio numeric;
  v_key uuid;
  v_postings jsonb;
  v_tx_id uuid;
  v_vault_before text;
  v_vault_after text;
  v_current_vault_numeric numeric;
  v_new_aum numeric;
BEGIN
  -- 1. 관리자 권한 엄격 검증
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'approver'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator SWF liquidation denied: unauthorized actor';
  END IF;

  -- 2. 목표 AUM 검증 (최소 0 이상)
  IF p_target_aum IS NULL OR p_target_aum < 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'invalid target AUM amount';
  END IF;

  -- 3. 시스템 복식부기 계정 식별
  SELECT id INTO v_mint_id FROM public.accounts WHERE account_type = 'MINT' AND system_key = 'mint';
  SELECT id INTO v_treasury_id FROM public.accounts WHERE account_type = 'TREASURY' AND system_key = 'treasury';
  SELECT id, balance_wld INTO v_main_id, v_vault_before FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN';

  IF v_mint_id IS NULL OR v_treasury_id IS NULL OR v_main_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'canonical treasury or mint accounts unavailable';
  END IF;

  -- 4. 현재 SWF 포트폴리오 총 평가액 산출
  SELECT COALESCE(SUM(current_valuation_wld), 0) INTO v_total_aum FROM public.treasury_swf_portfolios;

  IF v_total_aum <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'SWF_PORTFOLIO_EMPTY',
      'message', '청산할 국부펀드 보유 주식 포트폴리오가 없습니다.',
      'current_aum_wld', '0',
      'target_aum_wld', p_target_aum::text,
      'liquidated_wld', '0'
    );
  END IF;

  -- 5. 초과 매각 대상액 계산
  v_liquidate_amount := v_total_aum - p_target_aum;

  IF v_liquidate_amount <= 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'code', 'SWF_AUM_WITHIN_TARGET',
      'message', '현재 포트폴리오 AUM이 이미 목표 상한선 이하이므로 추가 매각 회수가 필요하지 않습니다.',
      'current_aum_wld', v_total_aum::text,
      'target_aum_wld', p_target_aum::text,
      'liquidated_wld', '0'
    );
  END IF;

  -- 6. 종목별 비례 차감 비율 산출
  v_ratio := v_liquidate_amount / v_total_aum;

  -- 각 종목 수량, 원금, 평가액 비례 차감
  UPDATE public.treasury_swf_portfolios
  SET quantity = round(quantity * (1 - v_ratio), 4),
      total_invested_wld = round(total_invested_wld * (1 - v_ratio), 0),
      current_valuation_wld = round(current_valuation_wld * (1 - v_ratio), 0),
      unrealized_pnl_wld = round(current_valuation_wld * (1 - v_ratio), 0) - round(total_invested_wld * (1 - v_ratio), 0),
      updated_at = clock_timestamp();

  -- 라운딩 오차를 배제한 정확한 실제 차감액 계산
  SELECT COALESCE(SUM(current_valuation_wld), 0) INTO v_new_aum FROM public.treasury_swf_portfolios;
  v_actual_liquidated := v_total_aum - v_new_aum;

  IF v_actual_liquidated <= 0 THEN
    RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'failed to compute liquidated AUM difference';
  END IF;

  -- 7. 불변 복식부기 전표 발행 (MINT credit -> TREASURY debit)
  v_key := gen_random_uuid();
  v_postings := jsonb_build_array(
    jsonb_build_object('accountId', v_mint_id, 'amount', v_actual_liquidated::text, 'direction', 'credit'),
    jsonb_build_object('accountId', v_treasury_id, 'amount', v_actual_liquidated::text, 'direction', 'debit')
  );

  v_tx_id := public.economy_post_transaction(
    v_key,
    'SWF_PORTFOLIO_LIQUIDATION',
    p_actor,
    NULL,
    v_postings,
    'treasury.swf_liquidation',
    jsonb_build_object(
      'description', '국부펀드 초과 AUM 주식 청산 및 중앙 금고(VAULT_MAIN) 환원 입금',
      'targetAum', p_target_aum::text,
      'liquidatedWld', v_actual_liquidated::text,
      'priorAum', v_total_aum::text,
      'newAum', v_new_aum::text
    )
  );

  -- 8. VAULT_MAIN 금고 잔액 증액 동기화
  v_current_vault_numeric := COALESCE(v_vault_before::numeric, 0) + v_actual_liquidated;
  v_vault_after := v_current_vault_numeric::text;

  UPDATE public.system_treasury_vaults
  SET balance_wld = v_vault_after,
      updated_at = clock_timestamp()
  WHERE code = 'VAULT_MAIN';

  -- 9. 국고 감사 원장(system_treasury_ledger)에 정식 인젝션 기록
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
    v_actual_liquidated::text,
    p_actor,
    '국부펀드 초과 AUM 주식 청산 및 중앙 금고(VAULT_MAIN) 환원 입금 (복식부기 전표 ' || v_tx_id::text || ')',
    COALESCE(v_vault_before, '0'),
    v_vault_after,
    v_tx_id,
    clock_timestamp()
  );

  -- 10. 국부펀드 감사 이벤트 기록
  INSERT INTO public.treasury_swf_events (
    event_type,
    amount_wld,
    summary,
    metadata,
    created_at
  ) VALUES (
    'PORTFOLIO_LIQUIDATED_TO_VAULT',
    v_actual_liquidated,
    '국고 자금 정상화 회수 완료: 주식 투자금 +' || v_actual_liquidated::text || ' WLD 회수 환원, 국고 현금 ' || v_vault_after || ' WLD 확보 (포트폴리오 잔여 ' || v_new_aum::text || ' WLD)',
    jsonb_build_object(
      'actor_id', p_actor,
      'target_aum', p_target_aum,
      'prior_aum', v_total_aum,
      'new_aum', v_new_aum,
      'transaction_id', v_tx_id
    ),
    clock_timestamp()
  );

  -- 11. SWF 실행 타임스탬프 갱신
  UPDATE public.treasury_swf_configs
  SET last_executed_at = clock_timestamp()
  WHERE id = 'current';

  -- 12. 최종 감사 영수증 반환
  RETURN jsonb_build_object(
    'success', true,
    'code', 'SWF_LIQUIDATION_SETTLED',
    'liquidated_wld', v_actual_liquidated::text,
    'prior_aum_wld', v_total_aum::text,
    'new_aum_wld', v_new_aum::text,
    'target_aum_wld', p_target_aum::text,
    'vault_main_balance', v_vault_after,
    'ledger_transaction_id', v_tx_id::text
  );
END;
$function$;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_swf_liquidate_to_vault(uuid, numeric) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_swf_liquidate_to_vault(uuid, numeric) TO moneyverse_app;

COMMIT;
