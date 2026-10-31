-- v1546: authorized SWF policy-only update; never moves WLD or executes trades.
-- Keep raw SWF tables private from the application role.
BEGIN;

CREATE OR REPLACE FUNCTION public.admin_swf_update_policy(p_actor uuid, p_changes jsonb)
RETURNS jsonb
LANGUAGE plpgsql VOLATILE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
DECLARE
  v_enabled boolean;
  v_safe numeric(38,0);
  v_single numeric(38,0);
  v_reinvest numeric(5,2);
  v_cap numeric(5,2);
BEGIN
  IF p_actor IS NULL OR NOT public.admin_role_holder(p_actor, 'approver'::public.admin_role) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='SWF governance permission denied';
  END IF;
  IF p_changes IS NULL OR jsonb_typeof(p_changes) <> 'object'
     OR p_changes = '{}'::jsonb
     OR (p_changes - 'is_enabled' - 'safe_reserve_wld' - 'max_single_investment_wld'
       - 'reinvestment_ratio_pct' - 'max_investment_ratio_pct') <> '{}'::jsonb THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='unsupported SWF policy changes';
  END IF;
  IF p_changes ? 'is_enabled' AND jsonb_typeof(p_changes->'is_enabled') <> 'boolean' THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid SWF enabled state';
  END IF;
  IF p_changes ? 'safe_reserve_wld'
     AND (jsonb_typeof(p_changes->'safe_reserve_wld') <> 'string'
       OR (p_changes->>'safe_reserve_wld') !~ '^(0|[1-9][0-9]{0,37})$') THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid SWF safe reserve';
  END IF;
  IF p_changes ? 'max_single_investment_wld'
     AND (jsonb_typeof(p_changes->'max_single_investment_wld') <> 'string'
       OR (p_changes->>'max_single_investment_wld') !~ '^(0|[1-9][0-9]{0,37})$') THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid SWF single investment cap';
  END IF;
  IF p_changes ? 'reinvestment_ratio_pct'
     AND (jsonb_typeof(p_changes->'reinvestment_ratio_pct') <> 'number'
       OR (p_changes->>'reinvestment_ratio_pct')::numeric NOT BETWEEN 0 AND 50
       OR (p_changes->>'reinvestment_ratio_pct')::numeric <>
          round((p_changes->>'reinvestment_ratio_pct')::numeric,2)) THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid SWF reinvestment percentage';
  END IF;
  IF p_changes ? 'max_investment_ratio_pct'
     AND (jsonb_typeof(p_changes->'max_investment_ratio_pct') <> 'number'
       OR (p_changes->>'max_investment_ratio_pct')::numeric NOT BETWEEN 5 AND 30
       OR (p_changes->>'max_investment_ratio_pct')::numeric <>
          round((p_changes->>'max_investment_ratio_pct')::numeric,2)) THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid SWF investment cap percentage';
  END IF;
  SELECT is_enabled, safe_reserve_wld, max_single_investment_wld,
         reinvestment_ratio_pct, max_investment_ratio_pct
    INTO v_enabled, v_safe, v_single, v_reinvest, v_cap
    FROM public.treasury_swf_configs
    WHERE id = 'current'
    FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE='55000', MESSAGE='SWF policy row unavailable';
  END IF;

  UPDATE public.treasury_swf_configs
  SET is_enabled = COALESCE((p_changes->>'is_enabled')::boolean,v_enabled),
      safe_reserve_wld = COALESCE((p_changes->>'safe_reserve_wld')::numeric,v_safe),
      max_single_investment_wld = COALESCE((p_changes->>'max_single_investment_wld')::numeric,v_single),
      reinvestment_ratio_pct = COALESCE((p_changes->>'reinvestment_ratio_pct')::numeric,v_reinvest),
      max_investment_ratio_pct = COALESCE((p_changes->>'max_investment_ratio_pct')::numeric,v_cap),
      updated_at = clock_timestamp()
  WHERE id = 'current';

  INSERT INTO public.treasury_swf_events(event_type,amount_wld,summary,metadata)
  VALUES ('GOVERNANCE_CONFIG_UPDATED',0,
    'Administrator updated SWF policy settings; no funds settled',
    jsonb_build_object('actor_id',p_actor,'changes',p_changes,'settled',false));

  RETURN public.admin_swf_snapshot(p_actor)->'config';
END;
$function$;

ALTER FUNCTION public.admin_swf_update_policy(uuid,jsonb) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_swf_update_policy(uuid,jsonb) FROM PUBLIC,moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_swf_update_policy(uuid,jsonb) TO moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.treasury_swf_configs,
  public.treasury_swf_portfolios, public.treasury_swf_events FROM PUBLIC,moneyverse_app;
COMMIT;
