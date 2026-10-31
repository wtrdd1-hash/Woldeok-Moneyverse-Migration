-- P0 C v1250: DB-owned public in-game enterprise projection read.
-- Adapted from closed/unmerged Backend B v533; new forward-only migration 318.
-- Forward-only. Financial amounts below are projections/reported amounts,
-- NOT proof of a posted ledger transaction or treasury remittance.
-- Does not mutate financial rows or grant direct table access.
BEGIN;

CREATE FUNCTION public.enterprise_public_disclosure_v1()
RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  WITH active_soe AS (
    SELECT
      coalesce(sum(total_assets_wld), 0)::text AS assets,
      coalesce(sum(operating_revenue_hourly_wld), 0)::text AS revenue,
      coalesce(sum(net_profit_hourly_wld), 0)::text AS profit,
      trunc(coalesce(sum(net_profit_hourly_wld * dividend_rate_bps / 10000), 0))::numeric(38,0)::text AS projected_dividends
    FROM public.state_enterprises
    WHERE status = 'ACTIVE'
  ),
  active_private AS (
    SELECT
      count(*)::integer AS enterprise_count,
      coalesce(sum(valuation_wld), 0)::text AS valuation,
      trunc(coalesce(sum(revenue_hourly_wld * corporate_tax_rate_bps / 10000), 0))::numeric(38,0)::text AS projected_tax
    FROM public.private_enterprises
    WHERE active = true
  ),
  public_soes AS (
    SELECT coalesce(jsonb_agg(to_jsonb(s) ORDER BY s.code), '[]'::jsonb) AS items
    FROM (
      SELECT id, code, name, category, ceo_name,
        total_assets_wld::text AS total_assets_wld,
        operating_revenue_hourly_wld::text AS operating_revenue_hourly_wld,
        operating_cost_hourly_wld::text AS operating_cost_hourly_wld,
        net_profit_hourly_wld::text AS net_profit_hourly_wld,
        dividend_rate_bps, eval_grade, eval_score, status, description,
        created_at::text AS created_at, updated_at::text AS updated_at
      FROM public.state_enterprises
      ORDER BY code
      LIMIT 100
    ) AS s
  ),
  public_private AS (
    SELECT coalesce(jsonb_agg(to_jsonb(p) ORDER BY p.symbol), '[]'::jsonb) AS items
    FROM (
      SELECT id, symbol, name, sector, stage,
        valuation_wld::text AS valuation_wld,
        revenue_hourly_wld::text AS revenue_hourly_wld,
        corporate_tax_rate_bps,
        tax_paid_total_wld::text AS tax_paid_total_wld,
        dividends_paid_total_wld::text AS dividends_paid_total_wld,
        active, created_at::text AS created_at, updated_at::text AS updated_at
      FROM public.private_enterprises
      ORDER BY symbol
      LIMIT 100
    ) AS p
  )
  SELECT jsonb_build_object(
    'overview', jsonb_build_object(
      'holding_name', '월덱 국가투자공사 (Woldeok State Holding Corp - WSHC)',
      'holding_code', 'WSHC_SOE_HOLDING',
      'total_soe_assets_wld', active_soe.assets,
      'hourly_soe_revenue_wld', active_soe.revenue,
      'hourly_soe_profit_wld', active_soe.profit,
      'hourly_soe_dividends_wld', active_soe.projected_dividends,
      'total_private_enterprises', active_private.enterprise_count,
      'total_private_valuation_wld', active_private.valuation,
      'hourly_corporate_tax_wld', active_private.projected_tax,
      'governance_model', '싱가포르 테마섹 + 노르웨이 GPFG 하이브리드 지주회사 모델'
    ),
    'soes', public_soes.items,
    'privateEnterprises', public_private.items,
    'financial_data_status', 'PROJECTION_ONLY_UNVERIFIED',
    'ledger_confirmed', false
  )
  FROM active_soe CROSS JOIN active_private CROSS JOIN public_soes CROSS JOIN public_private;
$$;

-- Function creation grants EXECUTE to PUBLIC by default; revoke it in the
-- same transaction before granting the app role the narrow read capability.
REVOKE ALL ON FUNCTION public.enterprise_public_disclosure_v1() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enterprise_public_disclosure_v1() TO moneyverse_app;
COMMIT;
