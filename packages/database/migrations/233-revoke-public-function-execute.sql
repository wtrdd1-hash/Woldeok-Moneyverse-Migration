-- Migration: 233-revoke-public-function-execute.sql
-- Closes the public execute privilege boundary for SECURITY DEFINER functions
-- created in recent feature migrations (221 through 232).
BEGIN;

ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

DO $$
DECLARE
  function_row record;
BEGIN
  FOR function_row IN
    SELECT
      pg_catalog.format(
        '%I.%I(%s)',
        namespace_row.nspname,
        procedure_row.proname,
        pg_catalog.pg_get_function_identity_arguments(procedure_row.oid)
      ) AS identity
    FROM pg_catalog.pg_proc AS procedure_row
    JOIN pg_catalog.pg_namespace AS namespace_row
      ON namespace_row.oid = procedure_row.pronamespace
    WHERE namespace_row.nspname = 'public'
      AND procedure_row.prosecdef
  LOOP
    EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || function_row.identity || ' FROM PUBLIC';
  END LOOP;
END;
$$;

COMMIT;
