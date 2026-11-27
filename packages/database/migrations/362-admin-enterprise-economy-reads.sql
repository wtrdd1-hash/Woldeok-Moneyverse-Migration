-- 362: the admin parity console read state_enterprises, private_enterprises, v_economy_summary and
-- v_daily_economy_stats directly. None of them is granted to the application role, so every one of
-- those screens answered 42501. Actor-checked read functions instead (template: 324). Amounts are
-- passed through as text exactly as stored. No table or view grant is widened.

CREATE OR REPLACE FUNCTION public.admin_state_enterprises_read(p_actor uuid)
RETURNS TABLE (
  id uuid, code text, name text, category text, ceo_name text,
  total_assets_wld text, operating_revenue_hourly_wld text, operating_cost_hourly_wld text,
  net_profit_hourly_wld text, dividend_rate_bps integer, eval_grade text, eval_score integer,
  status text, description text, created_at text, updated_at text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS u JOIN public.user_roles AS r ON r.user_id = u.id
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active administrator role required';
  END IF;
  RETURN QUERY
    SELECT e.id, e.code, e.name, e.category, e.ceo_name,
      e.total_assets_wld::text, e.operating_revenue_hourly_wld::text, e.operating_cost_hourly_wld::text,
      e.net_profit_hourly_wld::text, e.dividend_rate_bps, e.eval_grade, e.eval_score,
      e.status, e.description, e.created_at::text, e.updated_at::text
    FROM public.state_enterprises AS e
    ORDER BY e.total_assets_wld DESC, e.id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_private_enterprises_read(p_actor uuid)
RETURNS TABLE (
  id uuid, symbol text, name text, sector text, stage text,
  valuation_wld text, revenue_hourly_wld text, corporate_tax_rate_bps integer,
  tax_paid_total_wld text, dividends_paid_total_wld text, active boolean, created_at text, updated_at text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS u JOIN public.user_roles AS r ON r.user_id = u.id
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active administrator role required';
  END IF;
  RETURN QUERY
    SELECT e.id, e.symbol, e.name, e.sector, e.stage,
      e.valuation_wld::text, e.revenue_hourly_wld::text, e.corporate_tax_rate_bps,
      e.tax_paid_total_wld::text, e.dividends_paid_total_wld::text, e.active, e.created_at::text, e.updated_at::text
    FROM public.private_enterprises AS e
    ORDER BY e.valuation_wld DESC, e.id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_economy_summary_read(p_actor uuid)
RETURNS TABLE (
  total_minted text, total_burned text, total_circulating text, today_minted text, today_burned text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS u JOIN public.user_roles AS r ON r.user_id = u.id
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active administrator role required';
  END IF;
  RETURN QUERY
    SELECT s.total_minted::text, s.total_burned::text, s.total_circulating::text,
      s.today_minted::text, s.today_burned::text
    FROM public.v_economy_summary AS s;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_daily_economy_stats_read(p_actor uuid, p_limit integer)
RETURNS TABLE (
  stat_date text, faucet_amount text, sink_amount text, tax_amount text, net_change text, sink_ratio_percent text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 90 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid economy stats limit';
  END IF;
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS u JOIN public.user_roles AS r ON r.user_id = u.id
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active administrator role required';
  END IF;
  -- sink_ratio_percent is a ratio, not money: it keeps its decimals.
  RETURN QUERY
    SELECT d.stat_date::text, d.faucet_amount::text, d.sink_amount::text, d.tax_amount::text,
      d.net_change::text, d.sink_ratio_percent::text
    FROM public.v_daily_economy_stats AS d
    ORDER BY d.stat_date DESC
    LIMIT p_limit;
END;
$function$;

ALTER FUNCTION public.admin_state_enterprises_read(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_private_enterprises_read(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_economy_summary_read(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_daily_economy_stats_read(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_state_enterprises_read(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_private_enterprises_read(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_economy_summary_read(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_daily_economy_stats_read(uuid, integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_state_enterprises_read(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_private_enterprises_read(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_economy_summary_read(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_daily_economy_stats_read(uuid, integer) TO moneyverse_app;
