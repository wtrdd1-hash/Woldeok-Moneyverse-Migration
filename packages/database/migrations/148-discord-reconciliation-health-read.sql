-- Give the scheduled Discord sentinel a narrow reconciliation read model.
-- Direct table access stays revoked from the application role.

BEGIN;

CREATE OR REPLACE FUNCTION public.discord_latest_reconciliation_health()
RETURNS TABLE(
  id uuid,
  integrity_ok boolean,
  balance_mismatch_account_count bigint,
  disallowed_negative_balance_account_count bigint,
  ledger_unbalanced_transaction_count bigint,
  balance_total_delta_amount bigint,
  calculated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT snapshot.id,
         snapshot.integrity_ok,
         snapshot.balance_mismatch_account_count,
         snapshot.disallowed_negative_balance_account_count,
         snapshot.ledger_unbalanced_transaction_count,
         snapshot.balance_total_delta_amount,
         snapshot.calculated_at
  FROM public.economy_reconciliation_snapshots AS snapshot
  ORDER BY snapshot.calculated_at DESC, snapshot.id DESC
  LIMIT 1
$$;

ALTER FUNCTION public.discord_latest_reconciliation_health() OWNER TO moneyverse_migrator;
REVOKE ALL PRIVILEGES ON FUNCTION public.discord_latest_reconciliation_health()
  FROM PUBLIC, moneyverse_reconciler;
GRANT EXECUTE ON FUNCTION public.discord_latest_reconciliation_health()
  TO moneyverse_app;

COMMIT;
