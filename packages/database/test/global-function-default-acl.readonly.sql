-- Zero rows is PASS. Explicitly scoped to the migration owner and the public schema.
-- pg_default_acl's absence of a global row means PostgreSQL's built-in PUBLIC
-- EXECUTE default remains in force for functions.
SELECT 'moneyverse_migrator: implicit PUBLIC EXECUTE on future functions' AS violation
WHERE NOT EXISTS (
  SELECT 1 FROM pg_catalog.pg_default_acl d
  JOIN pg_catalog.pg_roles r ON r.oid = d.defaclrole
  WHERE r.rolname = 'moneyverse_migrator'
    AND d.defaclnamespace = 0
    AND d.defaclobjtype = 'f'
    AND NOT EXISTS (
      SELECT 1 FROM pg_catalog.aclexplode(d.defaclacl) a
      WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'
    )
);
