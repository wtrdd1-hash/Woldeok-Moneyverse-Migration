-- v2026.11.03.1715: no application-role direct mutation of auxiliary
-- Treasury vault projections. All real WLD settlement uses the canonical
-- SECURITY DEFINER finance/treasury core and immutable double-entry journal.
-- Previously deployed numbered migrations and verified member balances stay untouched.
BEGIN;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.system_treasury_vaults
  FROM PUBLIC, moneyverse_app;

DO $guard$
BEGIN
  IF pg_catalog.has_table_privilege('moneyverse_app', 'public.system_treasury_vaults', 'INSERT')
     OR pg_catalog.has_table_privilege('moneyverse_app', 'public.system_treasury_vaults', 'UPDATE')
     OR pg_catalog.has_table_privilege('moneyverse_app', 'public.system_treasury_vaults', 'DELETE')
     OR pg_catalog.has_table_privilege('moneyverse_app', 'public.system_treasury_vaults', 'TRUNCATE')
     OR pg_catalog.has_table_privilege('moneyverse_app', 'public.system_treasury_vaults', 'REFERENCES')
     OR pg_catalog.has_table_privilege('moneyverse_app', 'public.system_treasury_vaults', 'TRIGGER')
     OR pg_catalog.has_any_column_privilege('moneyverse_app', 'public.system_treasury_vaults', 'UPDATE')
     OR pg_catalog.has_any_column_privilege('moneyverse_app', 'public.system_treasury_vaults', 'INSERT')
     OR pg_catalog.has_any_column_privilege('moneyverse_app', 'public.system_treasury_vaults', 'REFERENCES')
  THEN
    RAISE EXCEPTION 'TREASURY_VAULT_APP_DML_STILL_GRANTED'
      USING ERRCODE='42501';
  END IF;
END
$guard$;

COMMIT;
