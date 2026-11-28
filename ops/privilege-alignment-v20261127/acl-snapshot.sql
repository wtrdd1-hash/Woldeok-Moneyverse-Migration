-- Emits GRANT statements that recreate moneyverse_app's current privileges in schema public
-- (tables/views/sequences and functions) plus the migrator default ACL. Rollback input for 357.
\pset tuples_only on
\pset format unaligned
SELECT pg_catalog.format('GRANT %s ON TABLE public.%I TO moneyverse_app;', a.privilege_type, c.relname)
FROM pg_class c CROSS JOIN LATERAL aclexplode(c.relacl) a
WHERE c.relnamespace = 'public'::regnamespace AND a.grantee = 'moneyverse_app'::regrole
ORDER BY 1;
-- PUBLIC entries are emitted as PUBLIC: 357 revokes from PUBLIC as well, and a NULL ACL means PUBLIC may execute.
SELECT pg_catalog.format('GRANT EXECUTE ON FUNCTION %s TO %s;', p.oid::regprocedure, CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE 'moneyverse_app' END)
FROM pg_proc p CROSS JOIN LATERAL aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
WHERE p.pronamespace = 'public'::regnamespace AND a.grantee IN ('moneyverse_app'::regrole, 0) AND a.privilege_type = 'EXECUTE'
ORDER BY 1;
SELECT 'ALTER DEFAULT PRIVILEGES FOR ROLE moneyverse_migrator IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO moneyverse_app;'
WHERE EXISTS (SELECT 1 FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a
  WHERE d.defaclrole = 'moneyverse_migrator'::regrole AND d.defaclnamespace = 'public'::regnamespace AND d.defaclobjtype = 'f' AND a.grantee = 'moneyverse_app'::regrole);
