-- 280-qualification-ledger-settlement-hold.sql
-- P0: Migration 234's certification path directly changed account_balances
-- without writing balanced ledger_transactions/ledger_postings. Keep the
-- historical migration immutable and stop all entrypoints until an audited,
-- idempotent ledger-first replacement has passed the release gates.
-- The existing function signature remains for dependent callers, but no
-- privileged caller can accidentally reactivate the unjournaled charge.
BEGIN;

CREATE OR REPLACE FUNCTION public.job_certify_qualification(
  p_actor uuid,
  p_job_type text,
  p_code text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
  RAISE EXCEPTION 'Qualification certification is unavailable pending ledger-first settlement'
    USING ERRCODE = '55000';
END;
$$;

REVOKE ALL ON FUNCTION public.job_certify_qualification(uuid, text, text)
  FROM PUBLIC, moneyverse_app;

-- Keep member-owned qualification reads working. The app must not forge
-- certification rows via the direct DML privileges granted by migration 234.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.user_job_qualifications
  FROM PUBLIC, moneyverse_app;

COMMIT;
