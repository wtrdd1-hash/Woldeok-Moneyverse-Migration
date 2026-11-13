-- Read-only P0 gate: PUBLIC must never EXECUTE SECURITY DEFINER routines.
-- has_function_privilege includes implicit PUBLIC grants, unlike proacl-only checks.
SELECT pg_catalog.format('%I.%I(%s)', n.nspname, p.proname,
       pg_catalog.pg_get_function_identity_arguments(p.oid)) AS exposed_function
FROM pg_catalog.pg_proc p
JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef
  AND pg_catalog.has_function_privilege('public', p.oid, 'EXECUTE')
ORDER BY exposed_function;
