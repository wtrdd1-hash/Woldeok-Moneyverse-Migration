-- Read-only P0 gate: function creator must not implicitly grant PUBLIC EXECUTE.
-- Schema-specific REVOKE cannot cancel PostgreSQL's global function defaults.
WITH creator AS (
  SELECT oid FROM pg_roles WHERE rolname = 'moneyverse_migrator'
), effective_global AS (
  SELECT c.oid AS creator_oid,
         COALESCE(d.defaclacl, pg_catalog.acldefault('f', c.oid)) AS acl
  FROM creator c
  LEFT JOIN pg_default_acl d
    ON d.defaclrole = c.oid AND d.defaclnamespace = 0 AND d.defaclobjtype = 'f'
)
SELECT 'moneyverse_migrator: PUBLIC EXECUTE on future functions' AS violation
FROM effective_global e
CROSS JOIN LATERAL pg_catalog.aclexplode(e.acl) x
WHERE x.grantee = 0 AND x.privilege_type = 'EXECUTE'
UNION ALL
SELECT 'moneyverse_migrator role missing: cannot verify function defaults'
WHERE NOT EXISTS (SELECT 1 FROM creator);
