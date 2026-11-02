#!/usr/bin/env node
/**
 * Read-only release preflight for default TABLE privileges that could grant
 * future objects to the application role without an explicit migration grant.
 * This does not repair existing-table ACL drift or authorize a deployment.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const TABLE_PRIVILEGES = new Set([
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'REFERENCES', 'TRIGGER', 'MAINTAIN',
]);

export function evaluateAppDefaultAcl({ rows, identity } = {}, { expectedDatabase, expectedRole } = {}) {
  const blockers = [];
  if (!identity || identity.database !== expectedDatabase || identity.role !== expectedRole ||
      typeof expectedDatabase !== 'string' || !expectedDatabase ||
      typeof expectedRole !== 'string' || !expectedRole || identity.app_role_exists !== true) {
    blockers.push('unverified_app_database_identity');
  }
  if (!Array.isArray(rows)) blockers.push('unverified_default_acl_rows');
  const seen = new Set();
  let unsafeDefaultTableGrants = 0;
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!row || typeof row.owner_role !== 'string' || !row.owner_role ||
        (row.scope !== 'public' && row.scope !== '<all schemas>') ||
        !['moneyverse_app', 'PUBLIC'].includes(row.grantee) ||
        !TABLE_PRIVILEGES.has(row.privilege)) {
      blockers.push('invalid_default_acl_row');
      continue;
    }
    const key = [row.owner_role, row.scope, row.grantee, row.privilege].join(':');
    if (seen.has(key)) {
      blockers.push('duplicate_default_acl_row');
      continue;
    }
    seen.add(key);
    unsafeDefaultTableGrants++;
    blockers.push('unsafe_default_table_acl:' + key);
  }
  return {
    ok: blockers.length === 0,
    status: blockers.length === 0 ? 'READY_FOR_OTHER_RELEASE_GATES' : 'BLOCKED',
    blockers,
    summary: {
      database: identity?.database ?? null,
      role: identity?.role ?? null,
      unsafeDefaultTableGrants,
    },
    caveat: 'Existing-table grants, function/sequence default privileges, migration checksums, ledger integrity, exact-SHA Test and recovery are separate mandatory release gates.',
  };
}

// Check both schema-specific defaults and global defaults. A PUBLIC grant also
// reaches moneyverse_app, even if no direct ACL item names the application role.
export const DEFAULT_TABLE_ACL_SQL = `
SELECT owner.rolname AS owner_role,
       CASE WHEN d.defaclnamespace = 0 THEN '<all schemas>' ELSE n.nspname END AS scope,
       CASE WHEN a.grantee = 0 THEN 'PUBLIC' ELSE grantee.rolname END AS grantee,
       a.privilege_type AS privilege
FROM pg_catalog.pg_default_acl d
JOIN pg_catalog.pg_roles owner ON owner.oid = d.defaclrole
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = d.defaclnamespace
CROSS JOIN LATERAL pg_catalog.aclexplode(d.defaclacl) a
LEFT JOIN pg_catalog.pg_roles grantee ON grantee.oid = a.grantee
WHERE d.defaclobjtype = 'r'
  AND (d.defaclnamespace = 0 OR n.nspname = 'public')
  AND (a.grantee = 0 OR grantee.rolname = 'moneyverse_app')
ORDER BY owner.rolname, scope, grantee, privilege
`;

export async function readAppDefaultAclSnapshot(client) {
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    await client.query("SET LOCAL statement_timeout = '10000ms'");
    const identity = (await client.query(`
      SELECT current_database() AS database, current_user AS role,
             EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'moneyverse_app') AS app_role_exists
    `)).rows[0];
    const rows = (await client.query(DEFAULT_TABLE_ACL_SQL)).rows;
    return { identity, rows };
  } finally {
    await client.query('ROLLBACK');
  }
}

function readDatabaseUrl(path) {
  const content = fs.readFileSync(path, 'utf8');
  const match = content.match(/^DATABASE_URL=(.*)$/m);
  if (!match) throw Error('missing approved DATABASE_URL');
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 6 || args[0] !== '--env-file' || !args[1].startsWith('/') ||
      args[2] !== '--expected-database' || args[4] !== '--expected-role' ||
      !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(args[3]) ||
      !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(args[5])) {
    throw Error('invalid_arguments');
  }
  const require = createRequire(new URL('../../backend/package.json', import.meta.url));
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: readDatabaseUrl(args[1]), max: 1,
    connectionTimeoutMillis: 4000, application_name: 'moneyverse_readonly_default_acl_gate' });
  try {
    const client = await pool.connect();
    try {
      const report = evaluateAppDefaultAcl(await readAppDefaultAclSnapshot(client), {
        expectedDatabase: args[3], expectedRole: args[5],
      });
      console.log(JSON.stringify(report, null, 2));
      if (!report.ok) process.exitCode = 2;
    } finally { client.release(); }
  } finally { await pool.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    // Never print a connection string or a driver error containing credentials.
    console.error(JSON.stringify({ status: 'BLOCKED', reason: error.code ?? 'default_acl_verification_failed' }));
    process.exitCode = 2;
  });
}
