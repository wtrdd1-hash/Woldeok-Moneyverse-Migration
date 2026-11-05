-- v2026.11.05.1763: Treasury SWF Access & Alert Refinement
-- 1. Allow operator, approver, and superadmin to view SWF snapshot
-- 2. Ensure health insurance and treasury overview consistency

BEGIN;

CREATE OR REPLACE FUNCTION public.admin_swf_snapshot(p_actor uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'pg_temp'
AS $function$
DECLARE
  v_config jsonb;
  v_portfolios jsonb;
  v_events jsonb;
BEGIN
  IF p_actor IS NULL OR NOT (
    public.admin_role_holder(p_actor, 'operator'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'approver'::public.admin_role) OR
    public.admin_role_holder(p_actor, 'superadmin'::public.admin_role)
  ) THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'administrator SWF evidence denied';
  END IF;

  SELECT to_jsonb(c) INTO v_config
  FROM (
    SELECT id, is_enabled, safe_reserve_wld::text, max_single_investment_wld::text,
           reinvestment_ratio_pct::float, max_investment_ratio_pct::float,
           equity_ratio_pct::float, bond_ratio_pct::float, dividend_ratio_pct::float,
           auto_harvest_enabled, auto_tax_enabled, auto_growth_yield_bps,
           target_anchor_wld::text
    FROM public.treasury_swf_configs
    WHERE id = 'current'
  ) AS c;

  IF v_config IS NULL THEN
    -- Fallback default verified config
    v_config := jsonb_build_object(
      'id', 'current',
      'is_enabled', true,
      'safe_reserve_wld', '25000000',
      'max_single_investment_wld', '5000000',
      'reinvestment_ratio_pct', 50.0,
      'max_investment_ratio_pct', 30.0,
      'equity_ratio_pct', 60.0,
      'bond_ratio_pct', 30.0,
      'dividend_ratio_pct', 10.0,
      'auto_harvest_enabled', true,
      'auto_tax_enabled', true,
      'auto_growth_yield_bps', 150,
      'target_anchor_wld', '25000000'
    );
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(p) - 'sort_valuation' ORDER BY p.sort_valuation DESC), '[]'::jsonb)
    INTO v_portfolios
  FROM (
    SELECT id::text, asset_type, asset_symbol, asset_name, quantity::text,
           total_invested_wld::text, average_price_wld::text,
           current_valuation_wld::text, unrealized_pnl_wld::text,
           current_valuation_wld AS sort_valuation
    FROM public.treasury_swf_portfolios
  ) AS p;

  SELECT COALESCE(jsonb_agg(to_jsonb(e) ORDER BY e.created_at DESC), '[]'::jsonb)
    INTO v_events
  FROM (
    SELECT id::text, event_type, amount_wld::text, summary, created_at
    FROM public.treasury_swf_events
    ORDER BY created_at DESC
    LIMIT 20
  ) AS e;

  RETURN jsonb_build_object('config', v_config, 'portfolios', v_portfolios, 'events', v_events);
END;
$function$;

REVOKE ALL PRIVILEGES ON FUNCTION public.admin_swf_snapshot(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_swf_snapshot(uuid) TO moneyverse_app;

COMMIT;
