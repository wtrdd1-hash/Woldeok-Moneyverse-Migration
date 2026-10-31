-- P0: migration 222's club charter and cooperative contribution functions
-- debit/credit account_balances directly, then insert ledger_transactions
-- without matching ledger_postings. The ON CONFLICT DO NOTHING key also fails
-- to make retries idempotent. NestJS holds cannot prevent SECURITY DEFINER
-- owner invocations. Keep applied 222 immutable and historical data untouched.
-- Depends on 318 (B v702, PR #2227) for app-role core financial DML revocation.
BEGIN;

CREATE OR REPLACE FUNCTION public.club_create(
  p_actor uuid, p_tag text, p_name text, p_description text,
  p_charter text, p_join_mode text, p_idempotency_key uuid
)
RETURNS TABLE(
  club_id uuid, tag text, name text, status text, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $hold$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'club charter ledger settlement unavailable';
END;
$hold$;

CREATE OR REPLACE FUNCTION public.club_contribute_project(
  p_actor uuid, p_club_id uuid, p_project_id uuid,
  p_amount numeric, p_idempotency_key uuid
)
RETURNS TABLE(
  contribution_id uuid, accepted_amount numeric,
  project_current_wld text, project_status text
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $hold$
BEGIN
  RAISE EXCEPTION USING ERRCODE = '55000',
    MESSAGE = 'club contribution ledger settlement unavailable';
END;
$hold$;

REVOKE EXECUTE ON FUNCTION public.club_create(uuid, text, text, text, text, text, uuid) FROM PUBLIC, moneyverse_app;
REVOKE EXECUTE ON FUNCTION public.club_contribute_project(uuid, uuid, uuid, numeric, uuid) FROM PUBLIC, moneyverse_app;

-- No current member write path needs direct project or contribution mutation:
-- preserve SELECT and the separate club membership/feed DML paths. These
-- revocations also remove forged project totals and contribution receipts.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.club_projects FROM PUBLIC, moneyverse_app;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.club_project_contributions FROM PUBLIC, moneyverse_app;

COMMIT;
