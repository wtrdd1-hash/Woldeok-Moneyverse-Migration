-- Fail closed when future objects created by migrator grant app broad access.
-- Include both global and public-scoped default privileges.
SELECT COALESCE(n.nspname, '<global>') || ':' ||
       CASE a.defaclobjtype WHEN 'r' THEN 'table' WHEN 'S' THEN 'sequence' WHEN 'f' THEN 'function' END ||
       ':' || x.privilege_type AS forbidden_default_grant
FROM pg_catalog.pg_default_acl a
JOIN pg_catalog.pg_roles owner_role ON owner_role.oid = a.defaclrole
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = a.defaclnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(a.defaclacl) x
JOIN pg_catalog.pg_roles grantee_role ON grantee_role.oid = x.grantee
WHERE owner_role.rolname = 'moneyverse_migrator'
  AND (a.defaclnamespace = 0 OR n.nspname = 'public')
  AND grantee_role.rolname = 'moneyverse_app'
  AND ((a.defaclobjtype = 'r' AND x.privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER','MAINTAIN'))
    OR (a.defaclobjtype = 'S' AND x.privilege_type IN ('USAGE','UPDATE')))
ORDER BY 1;
