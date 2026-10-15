-- Scoped read-only Treasury overview; keep all raw financial SELECT revoked.
BEGIN;
CREATE OR REPLACE FUNCTION public.treasury_admin_overview_snapshot(p_actor uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,pg_temp
AS $fn$
DECLARE v_vaults jsonb; v_total numeric; v_reserve numeric; v_stats jsonb;
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor,'operator'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Treasury operator required';
  END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(v) ORDER BY code),'[]'::jsonb),
    coalesce(sum(balance_wld::numeric),0),
    coalesce(sum(balance_wld::numeric) FILTER (WHERE code='VAULT_EMERGENCY'),0)
  INTO v_vaults,v_total,v_reserve FROM public.system_treasury_vaults v;
  SELECT jsonb_build_object(
    'injected_wld',coalesce(sum(amount_wld::numeric) FILTER (WHERE tx_type='INJECTION'),0)::text,
    'absorbed_wld',coalesce(sum(amount_wld::numeric) FILTER (WHERE tx_type='ABSORPTION_SINK'),0)::text,
    'stock_halt_funded_wld',coalesce(sum(amount_wld::numeric) FILTER (WHERE tx_type='STOCK_HALT_SETTLEMENT'),0)::text,
    'recirculated_wld',coalesce(sum(amount_wld::numeric) FILTER (WHERE tx_type='FEE_RECIRCULATION'),0)::text
  ) INTO v_stats FROM public.system_treasury_ledger
  WHERE created_at >= statement_timestamp()-interval '24 hours';
  RETURN jsonb_build_object('vaults',v_vaults,'total_treasury_wld',v_total::text,
    'reserve_wld',v_reserve::text,'stats_24h',v_stats,'funding_status','UNVERIFIED');
END;
$fn$;
ALTER FUNCTION public.treasury_admin_overview_snapshot(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL ON FUNCTION public.treasury_admin_overview_snapshot(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.treasury_admin_overview_snapshot(uuid) FROM moneyverse_app;
GRANT EXECUTE ON FUNCTION public.treasury_admin_overview_snapshot(uuid) TO moneyverse_app;
COMMIT;
