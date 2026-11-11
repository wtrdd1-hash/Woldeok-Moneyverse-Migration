-- Read-only forward-looking privilege audit: default table grants survive REVOKE
-- on existing tables and silently affect future tables created by the grant owner.
-- Global (namespace OID 0) grants apply across schemas; public-scoped grants
-- apply to future public tables. Any row means a future public table can
-- inherit a grant to moneyverse_app or PUBLIC (effective for every role).
SELECT d.defaclrole::regrole::text AS creator_role,
       COALESCE(n.nspname, '<global>') AS schema_name,
       a.grantor::regrole::text AS grantor,
       CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE a.grantee::regrole::text END AS grantee,
       a.privilege_type,
       a.is_grantable
FROM pg_catalog.pg_default_acl AS d
LEFT JOIN pg_catalog.pg_namespace AS n ON n.oid = d.defaclnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) AS a
WHERE (d.defaclnamespace = 0 OR n.nspname = 'public')
  AND d.defaclobjtype = 'r'
  AND (a.grantee = 0 OR a.grantee = 'moneyverse_app'::regrole::oid)
  AND a.privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE',
                           'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN')
ORDER BY creator_role, schema_name, privilege_type;
