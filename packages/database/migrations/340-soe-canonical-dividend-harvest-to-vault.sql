-- Migration: 340-soe-canonical-dividend-harvest-to-vault.sql
-- Description: Establish canonical double-entry SOE dividend harvest to VAULT_MAIN with immutable receipts.

CREATE OR REPLACE FUNCTION public.admin_soe_harvest_dividends_to_vault(p_actor uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_mint_id uuid;
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

  -- 2. 시스템 복식부기 계정 식별
  SELECT id INTO v_mint_id FROM public.accounts WHERE account_type = 'MINT' AND system_key = 'mint';
  SELECT id INTO v_treasury_id FROM public.accounts WHERE account_type = 'TREASURY' AND system_key = 'treasury';
  SELECT id, balance_wld INTO v_main_id, v_vault_before FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN';

  IF v_mint_id IS NULL OR v_treasury_id IS NULL OR v_main_id IS NULL THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'canonical treasury or mint accounts unavailable';
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

  -- 4. 불변 복식부기 전표 발행 (MINT credit -> TREASURY debit)
  v_key := gen_random_uuid();
  v_postings := jsonb_build_array(
    jsonb_build_object('accountId', v_mint_id, 'amount', v_total_dividend::text, 'direction', 'credit'),
    jsonb_build_object('accountId', v_treasury_id, 'amount', v_total_dividend::text, 'direction', 'debit')
  );

  v_tx_id := public.economy_post_transaction(
    v_key,
    'SOE_DIVIDEND_HARVEST',
    p_actor,
    NULL,
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

  -- 6. 국고 감사 원장(system_treasury_ledger)에 정식 수입 인젝션 기록
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

  -- 7. 각 공기업별 배당 영수증(state_enterprise_dividend_logs) 개별 기록
  FOR r IN (
    SELECT id, operating_revenue_hourly_wld, net_profit_hourly_wld, dividend_rate_bps, eval_grade
      FROM public.state_enterprises
     WHERE status = 'ACTIVE' AND dividend_rate_bps > 0
  ) LOOP
    v_soe_div := round(r.net_profit_hourly_wld::numeric * r.dividend_rate_bps::numeric / 10000, 0);
    INSERT INTO public.state_enterprise_dividend_logs (
      id,
      enterprise_id,
      dividend_amount_wld,
      revenue_wld,
      net_profit_wld,
      eval_grade,
      ledger_tx_id,
      created_at
    ) VALUES (
      gen_random_uuid(),
      r.id,
      v_soe_div,
      r.operating_revenue_hourly_wld,
      r.net_profit_hourly_wld,
      r.eval_grade,
      v_tx_id,
      clock_timestamp()
    );
  END LOOP;

  -- 8. 최종 결과 반환
  RETURN jsonb_build_object(
    'success', true,
    'code', 'SOE_DIVIDEND_HARVESTED',
    'message', '공기업 배당금이 국고 중앙 금고(VAULT_MAIN)로 복식부기 입금되었습니다.',
    'total_dividends_collected', v_total_dividend::text,
    'enterprises_processed', v_enterprises_count,
    'treasury_balance_after', v_vault_after,
    'ledger_transaction_id', v_tx_id::text
  );
END;
$function$;

GRANT EXECUTE ON FUNCTION public.admin_soe_harvest_dividends_to_vault(uuid) TO moneyverse_app, postgres;
