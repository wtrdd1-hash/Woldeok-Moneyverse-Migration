-- Read-only forward-looking privilege audit: default table grants survive REVOKE
-- on existing tables and silently affect future tables created by the grant owner.
-- Any row means future public tables can inherit a direct moneyverse_app grant.
SELECT d.defaclrole::regrole::text AS creator_role,
       n.nspname AS schema_name,
       a.grantor::regrole::text AS grantor,
       a.privilege_type,
       a.is_grantable
FROM pg_catalog.pg_default_acl AS d
JOIN pg_catalog.pg_namespace AS n ON n.oid = d.defaclnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) AS a
WHERE n.nspname = 'public'
  AND d.defaclobjtype = 'r'
  AND a.grantee = 'moneyverse_app'::regrole::oid
  AND a.privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE',
                           'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN')
ORDER BY creator_role, schema_name, privilege_type;
