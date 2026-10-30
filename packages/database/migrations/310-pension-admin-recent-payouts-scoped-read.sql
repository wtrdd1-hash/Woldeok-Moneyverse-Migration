-- P1: Administrative NPS payout history must not depend on broad app-role SELECT.
-- Forward-only after 309. The actor is the authenticated admin session identity;
-- PostgreSQL checks an active account and an administrator role independently.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.national_pension_payout_logs FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.pension_admin_recent_payouts(p_actor uuid, p_limit integer)
RETURNS SETOF public.national_pension_payout_logs
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_actor = '00000000-0000-0000-0000-000000000000'::uuid
      OR p_limit IS NULL OR p_limit < 1 OR p_limit > 100 THEN
    RAISE EXCEPTION 'invalid administrator or pension payout limit' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.users AS u
    JOIN public.user_roles AS r ON r.user_id = u.id
    WHERE u.id = p_actor AND u.status = 'active'::public.user_status
  ) THEN
    RAISE EXCEPTION 'active administrator role required' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT p.* FROM public.national_pension_payout_logs AS p
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT p_limit;
END;
$function$;

ALTER FUNCTION public.pension_admin_recent_payouts(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.pension_admin_recent_payouts(uuid, integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_admin_recent_payouts(uuid, integer) TO moneyverse_app;
COMMIT;
