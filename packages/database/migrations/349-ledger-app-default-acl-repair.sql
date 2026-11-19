-- Forward-only least-privilege repair for immutable journal tables.
-- Applied migrations must not be edited. Existing data and function grants are untouched.
BEGIN;

-- Default privileges are creator-specific; both observed creators had
-- overbroad future-table grants to the application role.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM moneyverse_app;
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM moneyverse_app;

-- Default privilege changes do not affect tables that already exist.
REVOKE ALL PRIVILEGES ON TABLE public.ledger_transactions, public.ledger_postings FROM moneyverse_app;
GRANT SELECT ON TABLE public.ledger_transactions, public.ledger_postings TO moneyverse_app;

COMMIT;
