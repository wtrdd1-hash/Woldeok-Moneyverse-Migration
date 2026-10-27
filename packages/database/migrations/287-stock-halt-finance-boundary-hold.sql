-- 287-stock-halt-finance-boundary-hold.sql
-- P0 #1553: migration 221 refunds holdings before migration 224 independently
-- funds the treasury vault. Funding has no stock/event replay receipt, so
-- repeated calls can debit the vault again; failure can leave partial state.
-- Backend v585 already rejects halt/retry, but a database caller can still
-- invoke the SECURITY DEFINER functions. Suspend BOTH SQL entry points until
-- a single ledger-atomic, immutable-receipt settlement is independently proven.
-- Forward-only: never rewrite applied migrations 221 or 224.
-- Release dependency: QA migration 285 and B migration 286 must first land in
-- contiguous, checksum-verified order; duplicate 283 must also be resolved.
BEGIN;

CREATE OR REPLACE FUNCTION public.stock_halt_and_settle(
  p_actor uuid,
  p_stock uuid,
  p_halt_event_id uuid DEFAULT gen_random_uuid()
)
RETURNS TABLE(
  settled_count bigint,
  total_refund_amount bigint,
  quarantined_count bigint,
  halt_status text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'stock halt settlement unavailable pending atomic funding and replay receipt';
END;
$$;

CREATE OR REPLACE FUNCTION public.treasury_fund_stock_halt(
  p_stock_id uuid,
  p_required_amount_wld text
)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'stock halt treasury funding unavailable pending atomic settlement and replay receipt';
END;
$$;

-- PostgreSQL grants function EXECUTE to PUBLIC by default. A revoked caller
-- must not reach a historical, non-idempotent SECURITY DEFINER entry point.
REVOKE EXECUTE ON FUNCTION public.stock_halt_and_settle(uuid, uuid, uuid) FROM PUBLIC, moneyverse_app;
REVOKE EXECUTE ON FUNCTION public.treasury_fund_stock_halt(uuid, text) FROM PUBLIC, moneyverse_app;

-- Existing settlement receipts are readable by their established read path,
-- but only the function owner may mutate them during a future certified flow.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.virtual_stock_halt_settlements FROM moneyverse_app;

-- Deliberately do not revoke DML on shared treasury tables in this migration:
-- bank, pension, FX and SWF paths currently issue direct SQL against them.
-- Their least-privilege remediation requires a separate audited migration.
COMMIT;
