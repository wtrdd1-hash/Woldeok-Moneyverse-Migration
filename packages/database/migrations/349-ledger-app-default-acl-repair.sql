-- Forward-only least-privilege repair for immutable journal tables.
-- Applied migrations must not be edited. Existing data and function grants are untouched.
BEGIN;

-- Default privileges are creator-specific; both observed creators had
-- overbroad future-table grants to the application role.
-- Fresh CI databases may have no postgres or moneyverse_migrator role.
-- Guard each creator independently; on DEV both exist and must be repaired.
DO $acl$
DECLARE creator text;
BEGIN
  FOREACH creator IN ARRAY ARRAY['postgres', 'moneyverse_migrator'] LOOP
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = creator) THEN
      -- Global defaults are additive to per-schema defaults; both must be revoked.
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES FOR ROLE %I REVOKE ALL PRIVILEGES ON TABLES FROM moneyverse_app',
        creator
      );
      EXECUTE format(
        'ALTER DEFAULT PRIVILEGES FOR ROLE %I IN SCHEMA public REVOKE ALL PRIVILEGES ON TABLES FROM moneyverse_app',
        creator
      );
    END IF;
  END LOOP;
END
$acl$;

-- Default privilege changes do not affect tables that already exist.
REVOKE ALL PRIVILEGES ON TABLE public.ledger_transactions, public.ledger_postings FROM moneyverse_app;
GRANT SELECT ON TABLE public.ledger_transactions, public.ledger_postings TO moneyverse_app;

COMMIT;
