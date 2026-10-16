-- v2026.10.17.755: stock-league read helpers. Never expose internal roles
-- or private portfolio ownership tables to the application role.
BEGIN;

CREATE OR REPLACE FUNCTION public.stock_league_is_admin(p_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $scoped$
  SELECT CASE WHEN p_user_id IS NULL THEN true ELSE EXISTS (
    SELECT 1 FROM public.user_roles r
    WHERE r.user_id=p_user_id
      AND r.role IN ('superadmin','operator','approver','server_operator')
  ) END;
$scoped$;
REVOKE ALL ON FUNCTION public.stock_league_is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stock_league_is_admin(uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.stock_league_portfolio_value(p_user_id uuid)
RETURNS numeric LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $scoped$
  SELECT CASE WHEN p_user_id IS NULL THEN 0 ELSE
    COALESCE(SUM(p.quantity::numeric * s.current_price::numeric),0)
    END
  FROM public.virtual_stock_positions p
  JOIN public.virtual_stocks s ON s.id=p.stock_id
  WHERE p.user_id=p_user_id;
$scoped$;
REVOKE ALL ON FUNCTION public.stock_league_portfolio_value(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.stock_league_portfolio_value(uuid) TO moneyverse_app;
COMMIT;
