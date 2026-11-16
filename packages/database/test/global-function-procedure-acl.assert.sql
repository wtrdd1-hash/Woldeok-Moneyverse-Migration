DO $$
BEGIN
  IF EXISTS (
      SELECT 1 FROM pg_catalog.pg_proc p
      CROSS JOIN LATERAL pg_catalog.aclexplode(
        COALESCE(p.proacl, pg_catalog.acldefault('f', p.proowner))
      ) acl
      WHERE p.proname IN ('acl_probe_fn', 'acl_probe_proc')
        AND acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
    ) THEN
    RAISE EXCEPTION 'PUBLIC EXECUTE remains on SECURITY DEFINER routine';
  END IF;
  IF NOT has_function_privilege('moneyverse_app', 'public.acl_probe_fn()', 'EXECUTE')
    OR NOT has_function_privilege('moneyverse_app', 'public.acl_probe_proc()', 'EXECUTE') THEN
    RAISE EXCEPTION 'explicit app EXECUTE was lost';
  END IF;
END $$;
