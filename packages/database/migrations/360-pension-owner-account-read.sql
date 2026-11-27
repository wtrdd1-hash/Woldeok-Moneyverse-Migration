-- 360: the member pension page read national_pension_accounts directly, which the chain never
-- granted to the application role (it worked only where privileges had drifted). This is the
-- actor-bound replacement: the function decides whose row is returned, not the caller's WHERE.
-- Read-only; no account is created here (opening an account stays a funded, ledgered action).

REVOKE ALL PRIVILEGES ON TABLE public.national_pension_accounts FROM PUBLIC, moneyverse_app;

CREATE OR REPLACE FUNCTION public.pension_owner_account(p_actor uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  tier text,
  status text,
  accumulated_contribution_wld text,
  total_contributions_count integer,
  hourly_payout_rate_bps integer,
  total_payout_received_wld text,
  last_payout_at timestamptz,
  retired_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $function$
  SELECT a.id, a.user_id, a.tier::text, a.status::text, a.accumulated_contribution_wld::text,
         a.total_contributions_count, a.hourly_payout_rate_bps, a.total_payout_received_wld::text,
         a.last_payout_at, a.retired_at, a.created_at, a.updated_at
  FROM public.national_pension_accounts AS a
  WHERE p_actor IS NOT NULL AND a.user_id = p_actor;
$function$;

ALTER FUNCTION public.pension_owner_account(uuid) OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.pension_owner_account(uuid) FROM PUBLIC, moneyverse_app;
GRANT EXECUTE ON FUNCTION public.pension_owner_account(uuid) TO moneyverse_app;
