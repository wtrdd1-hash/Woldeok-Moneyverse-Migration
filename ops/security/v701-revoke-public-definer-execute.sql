-- v2026.10.16.701: Emergency least-privilege DCL hotfix.
-- Scope: PUBLIC EXECUTE on exactly the 11 currently exposed SECURITY DEFINER
-- routines in public; retain all explicit moneyverse_app permissions.
-- No table DML, monetary writes, policies or role membership changes.
-- Applied separately from 269-271 ordered migrations; document as controlled
-- emergency DCL. Future numbered migration must reconcile this idempotently.
BEGIN;
SET LOCAL lock_timeout = '3s';
SET LOCAL statement_timeout = '20s';
DO $$
DECLARE
  exposed_count integer;
  unsafe_count integer;
  fn record;
BEGIN
  SELECT count(*) INTO exposed_count
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.prosecdef
    AND has_function_privilege('public',p.oid,'EXECUTE');
  IF exposed_count NOT IN (0,11) THEN
    RAISE EXCEPTION 'Unexpected PUBLIC SECURITY DEFINER count %, abort',exposed_count;
  END IF;
  SELECT count(*) INTO unsafe_count
  FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.prosecdef
    AND has_function_privilege('public',p.oid,'EXECUTE')
    AND NOT EXISTS(
      SELECT 1 FROM aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
      WHERE a.grantee='moneyverse_app'::regrole::oid
        AND a.privilege_type='EXECUTE'
    );
  IF unsafe_count<>0 THEN
    RAISE EXCEPTION 'App lacks explicit EXECUTE for % functions, abort',unsafe_count;
  END IF;
  FOR fn IN
    SELECT format('%I.%I(%s)',n.nspname,p.proname,pg_get_function_identity_arguments(p.oid)) AS signature
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.prosecdef
      AND has_function_privilege('public',p.oid,'EXECUTE')
  LOOP
    EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || fn.signature || ' FROM PUBLIC';
  END LOOP;
  IF EXISTS(
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.prosecdef
      AND has_function_privilege('public',p.oid,'EXECUTE')
  ) THEN RAISE EXCEPTION 'Postcondition failed: PUBLIC can execute definer'; END IF;
END $$;
COMMIT;
