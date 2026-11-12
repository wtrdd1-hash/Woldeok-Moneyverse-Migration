-- Read-only inspection of dangerous grants on existing public tables.
-- This complements the separate future/default ACL audit.
SELECT c.relname AS table_name,
       CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END AS grantee,
       a.privilege_type,
       a.is_grantable
FROM pg_catalog.pg_class AS c
JOIN pg_catalog.pg_namespace AS n ON n.oid = c.relnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(c.relacl) AS a
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
  AND (a.grantee = 0 OR a.grantee = 'moneyverse_app'::regrole::oid)
  AND a.privilege_type IN ('TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN')
ORDER BY c.relname, grantee, a.privilege_type;
