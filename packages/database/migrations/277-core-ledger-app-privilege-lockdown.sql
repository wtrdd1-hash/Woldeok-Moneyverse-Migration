-- v2026.10.18.804: remove dangerous direct app role access to immutable journal.
-- SECURITY DEFINER economy_post_transaction executes as its function owner,
-- not as moneyverse_app; keep its existing scoped EXECUTE grant intact.
-- This does not revoke legacy account/balance/vault DML or reconcile openings.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE public.ledger_transactions, public.ledger_postings FROM moneyverse_app;
GRANT SELECT ON TABLE public.ledger_transactions, public.ledger_postings TO moneyverse_app;

COMMIT;
