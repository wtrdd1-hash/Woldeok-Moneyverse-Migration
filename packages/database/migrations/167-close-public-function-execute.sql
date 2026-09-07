-- PostgreSQL grants EXECUTE on new functions to PUBLIC unless the creator's
-- default privileges say otherwise. Most migrations revoke that grant
-- explicitly, but a trigger function and one shop read function demonstrate
-- how easy it is for a later replacement to miss the step. Close the current
-- surface and make the safe state the default for functions created by the
-- migration owner.
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
