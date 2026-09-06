-- Narrow read model for the scheduled Discord audit-chain sentinel.

BEGIN;

CREATE OR REPLACE FUNCTION public.discord_latest_audit_chain_health()
RETURNS TABLE(
  verified boolean,
  failure_reason text,
  checked_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT verification.status IN ('passed', 'empty'),
         CASE
           WHEN verification.status IN ('passed', 'empty') THEN NULL
           ELSE coalesce(verification.detail::text, 'audit chain verification failed')
         END,
         verification.completed_at
  FROM public.audit_chain_verifications AS verification
  ORDER BY verification.completed_at DESC, verification.id DESC
  LIMIT 1
$$;

ALTER FUNCTION public.discord_latest_audit_chain_health() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.discord_latest_audit_chain_health()
  FROM PUBLIC, moneyverse_reconciler;
GRANT EXECUTE ON FUNCTION public.discord_latest_audit_chain_health()
  TO moneyverse_app;

COMMIT;
