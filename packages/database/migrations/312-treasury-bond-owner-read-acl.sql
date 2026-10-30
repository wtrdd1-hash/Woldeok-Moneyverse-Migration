-- P1 #2022: Bond holdings and repo reads cannot use raw app-role table SELECT.
-- Forward-only after the unmerged 307..311 stack. This does not enable finance writes.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.treasury_bond_holdings FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.treasury_bond_repo_loans FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.treasury_bonds FROM PUBLIC, moneyverse_app;

CREATE FUNCTION public.bond_owner_holdings(p_actor uuid)
RETURNS TABLE (
  id uuid, user_id uuid, bond_id uuid, bond_symbol text, bond_name text,
  units text, par_value_wld text, purchase_price_total_wld text,
  accrued_interest_wld text, hourly_coupon_rate_bps integer,
  annual_coupon_rate_bps integer, purchased_at text, maturity_at text,
  status text, auto_rollover boolean, collateral_locked boolean, hours_left integer
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_actor = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RAISE EXCEPTION 'valid bond owner required' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT h.id, h.user_id, h.bond_id, b.symbol, b.name,
           h.units::text, b.par_value_wld::text,
           h.purchase_price_total_wld::text, h.accrued_interest_wld::text,
           b.hourly_coupon_rate_bps, b.annual_coupon_rate_bps,
           h.purchased_at::text, h.maturity_at::text, h.status,
           h.auto_rollover, h.collateral_locked,
           GREATEST(0, ROUND(EXTRACT(EPOCH FROM (h.maturity_at - now())) / 3600))::integer
    FROM public.treasury_bond_holdings AS h
    JOIN public.treasury_bonds AS b ON b.id = h.bond_id
    WHERE h.user_id = p_actor
    ORDER BY h.purchased_at DESC, h.id DESC;
END;
$function$;

CREATE FUNCTION public.bond_owner_repo_loans(p_actor uuid)
RETURNS TABLE (
  id uuid, holding_id uuid, user_id uuid, bond_name text, bond_symbol text,
  principal_wld text, annual_interest_rate_bps integer,
  accrued_interest_wld text, ltv_percent integer, status text, created_at text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_actor = '00000000-0000-0000-0000-000000000000'::uuid THEN
    RAISE EXCEPTION 'valid bond owner required' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT l.id, l.holding_id, l.user_id, b.name, b.symbol,
           l.principal_wld::text, l.annual_interest_rate_bps,
           l.accrued_interest_wld::text, l.ltv_percent, l.status, l.created_at::text
    FROM public.treasury_bond_repo_loans AS l
    JOIN public.treasury_bond_holdings AS h ON h.id = l.holding_id
    JOIN public.treasury_bonds AS b ON b.id = h.bond_id
    WHERE l.user_id = p_actor AND h.user_id = p_actor
    ORDER BY l.created_at DESC, l.id DESC;
END;
$function$;

-- Published bond catalogue is public, but raw table writes/reads are not.
CREATE FUNCTION public.bond_public_catalog()
RETURNS SETOF public.treasury_bonds
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT b.* FROM public.treasury_bonds AS b;
$function$;

-- Public market figures are aggregate-only; no member row is exposed.
CREATE FUNCTION public.bond_public_read_totals()
RETURNS TABLE (holders_count text, coupons_paid_wld text, repo_active_principal_wld text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT
    (SELECT COUNT(DISTINCT h.user_id)::text
     FROM public.treasury_bond_holdings AS h WHERE h.status = 'HOLDING'),
    (SELECT COALESCE(SUM(c.amount_wld), 0)::text
     FROM public.treasury_bond_coupon_logs AS c WHERE c.event_type = 'COUPON_INTEREST'),
    (SELECT COALESCE(SUM(l.principal_wld), 0)::text
     FROM public.treasury_bond_repo_loans AS l WHERE l.status = 'ACTIVE');
$function$;

ALTER FUNCTION public.bond_owner_holdings(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bond_owner_repo_loans(uuid) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bond_public_catalog() OWNER TO moneyverse_migrator;
ALTER FUNCTION public.bond_public_read_totals() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.bond_owner_holdings(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.bond_owner_repo_loans(uuid) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.bond_public_catalog() FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.bond_public_read_totals() FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bond_owner_holdings(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bond_owner_repo_loans(uuid) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bond_public_catalog() TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.bond_public_read_totals() TO moneyverse_app;
COMMIT;
