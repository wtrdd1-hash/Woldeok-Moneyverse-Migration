-- Public NPS figures are aggregate-only; the application role must not read
-- individual pension accounts or treasury vaults to serve this portal.
-- This forward-only migration stacks after 307 (audit ACL) in Draft #1987.
BEGIN;

CREATE OR REPLACE FUNCTION public.pension_public_overview()
RETURNS TABLE (
  total_aum_wld text,
  total_subscribers_count bigint,
  total_retired_receivers_count bigint,
  total_pension_paid_wld text,
  vault_main_balance_wld text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT
    COALESCE(SUM(a.accumulated_contribution_wld), 0)::text,
    COUNT(a.id),
    COUNT(a.id) FILTER (WHERE a.status = 'RETIRED_RECEIVING'),
    COALESCE(SUM(a.total_payout_received_wld), 0)::text,
    (SELECT v.balance_wld FROM public.system_treasury_vaults AS v
      WHERE v.code = 'VAULT_MAIN' LIMIT 1)
  FROM public.national_pension_accounts AS a
  WHERE a.status <> 'LIQUIDATED';
$function$;

ALTER FUNCTION public.pension_public_overview() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.pension_public_overview() FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_public_overview() TO moneyverse_app;
-- Never grant direct SELECT on the underlying tables. No pension write grant changes.
COMMIT;
