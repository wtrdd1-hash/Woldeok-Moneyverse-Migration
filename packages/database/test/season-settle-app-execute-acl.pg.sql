-- Fresh isolated PostgreSQL integration assertion; never run against shared DB.
DO $acl$
DECLARE
  v_function oid;
BEGIN
  SELECT to_regprocedure('public.season_settle_rewards(uuid)')::oid INTO v_function;
  IF v_function IS NULL THEN
    RAISE EXCEPTION 'season_settle_rewards function missing';
  END IF;
  IF has_function_privilege('moneyverse_app', v_function, 'EXECUTE') THEN
    RAISE EXCEPTION 'P0: moneyverse_app can still execute season settlement';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    CROSS JOIN LATERAL pg_catalog.aclexplode(p.proacl) a
    WHERE p.oid = v_function AND a.grantee = 0 AND a.privilege_type = 'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'P0: PUBLIC still has season settlement EXECUTE';
  END IF;
  IF NOT has_function_privilege('moneyverse_migrator', v_function, 'EXECUTE') THEN
    RAISE EXCEPTION 'migrator owner lost function execution';
  END IF;
  IF NOT (SELECT prosecdef FROM pg_catalog.pg_proc WHERE oid = v_function) THEN
    RAISE EXCEPTION 'settlement function SECURITY DEFINER unexpectedly changed';
  END IF;
END;
$acl$;

SET ROLE moneyverse_app;
DO $deny$
BEGIN
  PERFORM * FROM public.season_settle_rewards('00000000-0000-0000-0000-000000000000'::uuid);
  RAISE EXCEPTION 'P0: app role unexpectedly executed season settlement';
EXCEPTION
  WHEN insufficient_privilege THEN
    NULL;
END;
$deny$;
RESET ROLE;
