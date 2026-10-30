-- P1: Member pension receipt reads must not require raw table SELECT grants.
-- Forward-only after 308; preserve historical receipt rows and financial holds.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.national_pension_contributions FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON TABLE public.national_pension_payout_logs FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.pension_owner_contributions(p_actor uuid, p_limit integer)
RETURNS SETOF public.national_pension_contributions
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_actor = '00000000-0000-0000-0000-000000000000'::uuid
      OR p_limit IS NULL OR p_limit < 1 OR p_limit > 50 THEN
    RAISE EXCEPTION 'invalid pension owner or receipt limit' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT c.* FROM public.national_pension_contributions AS c
    WHERE c.user_id = p_actor
    ORDER BY c.created_at DESC, c.id DESC LIMIT p_limit;
END;
$function$;

CREATE OR REPLACE FUNCTION public.pension_owner_payout_logs(p_actor uuid, p_limit integer)
RETURNS SETOF public.national_pension_payout_logs
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
BEGIN
  IF p_actor IS NULL OR p_actor = '00000000-0000-0000-0000-000000000000'::uuid
      OR p_limit IS NULL OR p_limit < 1 OR p_limit > 50 THEN
    RAISE EXCEPTION 'invalid pension owner or receipt limit' USING ERRCODE = '22023';
  END IF;
  RETURN QUERY
    SELECT p.* FROM public.national_pension_payout_logs AS p
    WHERE p.user_id = p_actor
    ORDER BY p.created_at DESC, p.id DESC LIMIT p_limit;
END;
$function$;

ALTER FUNCTION public.pension_owner_contributions(uuid, integer) OWNER TO moneyverse_migrator;
ALTER FUNCTION public.pension_owner_payout_logs(uuid, integer) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.pension_owner_contributions(uuid, integer) FROM PUBLIC, moneyverse_app;
REVOKE ALL PRIVILEGES ON FUNCTION public.pension_owner_payout_logs(uuid, integer) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_owner_contributions(uuid, integer) TO moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_owner_payout_logs(uuid, integer) TO moneyverse_app;
COMMIT;
