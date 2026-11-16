-- Read-only security regression: zero rows means no SECURITY DEFINER function
-- in the public schema is executable by PUBLIC (directly or via default ACL).
-- The owner and explicitly authorized application roles are not modified.
SELECT p.oid::regprocedure::text AS exposed_routine
FROM pg_catalog.pg_proc AS p
JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef
  AND EXISTS (
    SELECT 1
    FROM pg_catalog.aclexplode(
      COALESCE(p.proacl, pg_catalog.acldefault('f', p.proowner))
    ) AS acl
    WHERE acl.grantee = 0 AND acl.privilege_type = 'EXECUTE'
  )
ORDER BY 1;
