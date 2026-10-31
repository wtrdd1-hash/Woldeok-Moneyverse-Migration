-- v2026.10.31.1546: restore administrator policy configuration without granting
-- moneyverse_app direct UPDATE on SWF tables or weakening ledger settlement holds.
BEGIN;

CREATE OR REPLACE FUNCTION public.admin_swf_update_config(
  p_actor uuid,
  p_enabled boolean,
  p_safe_reserve_wld numeric,
  p_max_single_investment_wld numeric,
  p_reinvestment_ratio_pct numeric,
  p_max_investment_ratio_pct numeric
) RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  v_before jsonb;
  v_after jsonb;
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='administrator SWF governance denied';
  END IF;
  IF p_enabled IS NULL
     OR p_safe_reserve_wld IS NULL OR p_safe_reserve_wld < 0
     OR p_safe_reserve_wld <> trunc(p_safe_reserve_wld)
     OR p_safe_reserve_wld >= power(10::numeric, 38)
     OR p_max_single_investment_wld IS NULL OR p_max_single_investment_wld < 0
     OR p_max_single_investment_wld <> trunc(p_max_single_investment_wld)
     OR p_max_single_investment_wld >= power(10::numeric, 38)
     OR p_reinvestment_ratio_pct IS NULL
     OR p_reinvestment_ratio_pct < 0 OR p_reinvestment_ratio_pct > 50
     OR p_reinvestment_ratio_pct <> round(p_reinvestment_ratio_pct, 2)
     OR p_max_investment_ratio_pct IS NULL
     OR p_max_investment_ratio_pct < 5 OR p_max_investment_ratio_pct > 30
     OR p_max_investment_ratio_pct <> round(p_max_investment_ratio_pct, 2)
  THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid SWF policy bounds';
  END IF;

  SELECT to_jsonb(c) INTO v_before
  FROM public.treasury_swf_configs AS c
  WHERE c.id='current'
  FOR UPDATE;
  IF v_before IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='P0002', MESSAGE='SWF policy row unavailable';
  END IF;

  UPDATE public.treasury_swf_configs
  SET is_enabled = p_enabled,
      safe_reserve_wld = p_safe_reserve_wld,
      max_single_investment_wld = p_max_single_investment_wld,
      reinvestment_ratio_pct = p_reinvestment_ratio_pct,
      max_investment_ratio_pct = p_max_investment_ratio_pct,
      updated_at = clock_timestamp()
  WHERE id='current';

  SELECT to_jsonb(c) || jsonb_build_object(
    'safe_reserve_wld',c.safe_reserve_wld::text,
    'max_single_investment_wld',c.max_single_investment_wld::text,
    'target_anchor_wld',c.target_anchor_wld::text
  ) INTO v_after
  FROM public.treasury_swf_configs AS c WHERE c.id='current';

  -- Both update and audit event are atomic: any audit failure rolls back policy.
  -- No money, portfolio, or ledger mutation is performed.
  INSERT INTO public.treasury_swf_events(event_type,amount_wld,summary,metadata)
  VALUES (
    'GOVERNANCE_CONFIG_UPDATED',
    0,
    'Administrator SWF investment limits and reserves policy updated (no settlement).',
    jsonb_build_object(
      'actor_user_id',p_actor,'before',v_before,'after',v_after,
      'settlement_executed',false
    )
  );
  RETURN v_after;
END;
$function$;

ALTER FUNCTION public.admin_swf_update_config(uuid,boolean,numeric,numeric,numeric,numeric)
  OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_swf_update_config(uuid,boolean,numeric,numeric,numeric,numeric)
  FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_swf_update_config(uuid,boolean,numeric,numeric,numeric,numeric)
  TO moneyverse_app;

-- Original financial tables remain inaccessible to the application role.
REVOKE ALL PRIVILEGES ON TABLE public.treasury_swf_configs,
  public.treasury_swf_events, public.treasury_swf_portfolios FROM PUBLIC, moneyverse_app;
COMMIT;
