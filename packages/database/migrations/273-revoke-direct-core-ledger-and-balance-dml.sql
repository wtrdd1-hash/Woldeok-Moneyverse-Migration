-- v2026.10.16.738: remove direct application access to the canonical
-- financial projection, journal, account registry and treasury vault.
-- Never manipulate WLD balances, mint supply, ledger rows or member sessions.
--
-- Must be paired with reviewed ledger-first replacements for legacy app-SQL
-- mutations in PvP/league/marketplace/pension/bonds/FX/SWF before Production.
-- CI-equivalent seeded PostgreSQL is a prerequisite, not full domain E2E.
BEGIN;

REVOKE INSERT, UPDATE, DELETE ON TABLE
  public.account_balances,
  public.accounts,
  public.ledger_transactions,
  public.ledger_postings,
  public.system_treasury_vaults
FROM PUBLIC, moneyverse_app;

-- Fail the migration immediately if another inherited/default privilege
-- has silently left the application with unrestricted core financial writes.
DO $check$
DECLARE
  name text;
BEGIN
  FOREACH name IN ARRAY ARRAY[
    'account_balances','accounts','ledger_transactions',
    'ledger_postings','system_treasury_vaults'
  ] LOOP
    IF pg_catalog.has_table_privilege('moneyverse_app', pg_catalog.format('public.%I',name), 'INSERT')
       OR pg_catalog.has_table_privilege('moneyverse_app', pg_catalog.format('public.%I',name), 'UPDATE')
       OR pg_catalog.has_table_privilege('moneyverse_app', pg_catalog.format('public.%I',name), 'DELETE') THEN
      RAISE EXCEPTION USING ERRCODE = '42501',
        MESSAGE = 'core financial application DML remains: ' || name;
    END IF;
  END LOOP;
END;
$check$;

COMMIT;
