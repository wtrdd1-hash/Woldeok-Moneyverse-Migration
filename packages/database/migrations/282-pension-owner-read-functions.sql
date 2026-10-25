-- P0 #1302: restore pension member reads without granting raw table access.
-- This forward-only migration must be stacked after the unresolved 280/281
-- migration candidates; never apply it to Production out of sequence.
BEGIN;

REVOKE SELECT ON TABLE public.national_pension_accounts,
  public.national_pension_contributions,
  public.national_pension_payout_logs FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.pension_member_account(p_actor uuid)
RETURNS SETOF public.national_pension_accounts
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $pension$
  SELECT a.* FROM public.national_pension_accounts AS a
  WHERE a.user_id = p_actor;
$pension$;
ALTER FUNCTION public.pension_member_account(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.pension_member_account(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_member_account(uuid) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.pension_member_contributions(p_actor uuid, p_limit integer)
RETURNS SETOF public.national_pension_contributions
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $pension$
BEGIN
  IF p_actor IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'invalid pension contribution read request' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT c.* FROM public.national_pension_contributions AS c
    WHERE c.user_id = p_actor
    ORDER BY c.created_at DESC, c.id DESC LIMIT p_limit;
END;
$pension$;
ALTER FUNCTION public.pension_member_contributions(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.pension_member_contributions(uuid, integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_member_contributions(uuid, integer) TO moneyverse_app;

CREATE OR REPLACE FUNCTION public.pension_member_payouts(p_actor uuid, p_limit integer)
RETURNS SETOF public.national_pension_payout_logs
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $pension$
BEGIN
  IF p_actor IS NULL OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'invalid pension payout read request' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT p.* FROM public.national_pension_payout_logs AS p
    WHERE p.user_id = p_actor
    ORDER BY p.created_at DESC, p.id DESC LIMIT p_limit;
END;
$pension$;
ALTER FUNCTION public.pension_member_payouts(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.pension_member_payouts(uuid, integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_member_payouts(uuid, integer) TO moneyverse_app;

COMMIT;
