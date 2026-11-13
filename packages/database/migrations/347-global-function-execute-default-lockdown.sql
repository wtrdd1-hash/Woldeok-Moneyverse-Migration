-- Forward-only P0 hardening: schema-local default privilege revocations do not
-- override PostgreSQL's global PUBLIC EXECUTE default for newly created functions.
-- Keep explicitly granted application EXECUTE privileges; do not touch ledger data.
BEGIN;

-- Must run as/with membership in the role that creates future routines.
ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Existing SECURITY DEFINER routines also need explicit PUBLIC revocation.
-- Function owners retain implicit EXECUTE; individually granted app privileges remain.
DO $lockdown$
DECLARE
  routine record;
BEGIN
  FOR routine IN
    SELECT p.oid::regprocedure AS signature, p.prokind
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef
  LOOP
    EXECUTE pg_catalog.format(
      'REVOKE EXECUTE ON %s %s FROM PUBLIC',
      CASE WHEN routine.prokind = 'p' THEN 'PROCEDURE' ELSE 'FUNCTION' END,
      routine.signature
    );
  END LOOP;
END;
$lockdown$;

COMMIT;
