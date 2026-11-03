-- v2026.11.03.1714: restore the canonical ledger write boundary.
-- Forward-only; does not change member balances or create financial transactions.
BEGIN;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON TABLE public.accounts, public.account_balances
  FROM PUBLIC, moneyverse_app;
GRANT SELECT ON TABLE public.accounts, public.account_balances TO moneyverse_app;
DO $verify$
DECLARE table_name text; privilege_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['public.accounts', 'public.account_balances'] LOOP
    FOREACH privilege_name IN ARRAY ARRAY['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER'] LOOP
      IF pg_catalog.has_table_privilege('moneyverse_app', table_name, privilege_name) THEN
        RAISE EXCEPTION 'FINANCE_APP_RAW_ACCOUNT_DML_STILL_GRANTED: %.%', table_name, privilege_name USING ERRCODE='42501';
      END IF;
    END LOOP;
    IF NOT pg_catalog.has_table_privilege('moneyverse_app',table_name,'SELECT') THEN
      RAISE EXCEPTION 'FINANCE_APP_ACCOUNT_READ_REMOVED: %', table_name USING ERRCODE='42501';
    END IF;
  END LOOP;
END;
$verify$;
COMMIT;
