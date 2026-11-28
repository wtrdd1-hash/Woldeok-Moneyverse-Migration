-- 363: the admin bond console read treasury_bonds, treasury_bond_coupon_logs and (for the overview)
-- nothing at all: the overview answered a fallback of 3 active bonds and fixed benchmark yields when
-- the direct read failed, which it always does for the application role. Actor-checked reads
-- instead (template: 324). Amounts pass through as stored text; no table grant is widened.

CREATE OR REPLACE FUNCTION public.admin_treasury_bonds_read(p_actor uuid)
RETURNS TABLE (
  id text, symbol text, name text, maturity_hours integer, annual_coupon_rate_bps integer,
  hourly_coupon_rate_bps integer, par_value_wld text, total_issued_units text, available_units text,
  total_funded_wld text, status text, description text
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
    SELECT b.id::text, b.symbol, b.name, b.maturity_hours, b.annual_coupon_rate_bps,
      COALESCE(b.hourly_coupon_rate_bps, b.annual_coupon_rate_bps / 8760), b.par_value_wld::text,
      b.total_issued_units::text, b.available_units::text, COALESCE(b.total_funded_wld, 0)::text,
      b.status, COALESCE(b.description, '')
    FROM public.treasury_bonds AS b
    ORDER BY b.created_at, b.id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_treasury_bond_coupon_logs_read(p_actor uuid, p_limit integer)
RETURNS TABLE (
  id text, holding_id text, user_id text, bond_symbol text, bond_name text,
  event_type text, amount_wld text, created_at text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_limit IS NULL OR p_limit < 1 OR p_limit > 30 THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='invalid coupon log limit';
  END IF;
  IF p_actor IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.users AS u JOIN public.user_roles AS r ON r.user_id = u.id
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='active administrator role required';
  END IF;
  RETURN QUERY
    SELECT l.id::text, l.holding_id::text, l.user_id::text, b.symbol, b.name, l.event_type,
      l.amount_wld::text, to_char(l.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    FROM public.treasury_bond_coupon_logs AS l
    JOIN public.treasury_bonds AS b ON b.id = l.bond_id
    ORDER BY l.created_at DESC, l.id DESC
    LIMIT p_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_treasury_bonds_overview_read(p_actor uuid)
RETURNS TABLE (
  total_bonds_active bigint, total_funded_wld text, total_holders_count bigint, total_coupons_paid_wld text
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
    SELECT
      (SELECT count(*) FROM public.treasury_bonds AS b WHERE b.status IN ('OPEN_SUBSCRIPTION', 'TRADING')),
      (SELECT COALESCE(sum(COALESCE(b.total_funded_wld, 0)), 0)::text FROM public.treasury_bonds AS b),
      (SELECT count(DISTINCT h.user_id) FROM public.treasury_bond_holdings AS h WHERE h.status = 'HOLDING'),
      (SELECT COALESCE(sum(l.amount_wld), 0)::text FROM public.treasury_bond_coupon_logs AS l WHERE l.event_type = 'COUPON_INTEREST');
END;
$function$;

ALTER FUNCTION public.admin_treasury_bonds_read(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_treasury_bond_coupon_logs_read(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.admin_treasury_bonds_overview_read(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_treasury_bonds_read(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_treasury_bond_coupon_logs_read(uuid, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.admin_treasury_bonds_overview_read(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_treasury_bonds_read(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_treasury_bond_coupon_logs_read(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.admin_treasury_bonds_overview_read(uuid) TO moneyverse_app;
