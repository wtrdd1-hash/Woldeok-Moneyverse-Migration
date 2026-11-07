#!/usr/bin/env node
/**
 * Read-only release prerequisite for the application login role. A compromised
 * web process must not be able to SET ROLE, create persistent schema objects,
 * or use PostgreSQL administrative role attributes. This does not certify
 * table/function ACLs, SECURITY DEFINER search paths or runtime credentials.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const APP_ROLE = 'moneyverse_app';
const FALSE_FIELDS = [
  'role_superuser', 'role_createdb', 'role_createrole', 'role_replication',
  'role_bypassrls', 'role_inherit', 'can_create_database', 'can_create_public_schema',
];
const TRUE_FIELDS = ['app_role_exists', 'public_schema_exists', 'role_login', 'can_use_public_schema'];

export function evaluateAppRoleBoundary(snapshot, expectedDatabase) {
  const blockers = [];
  const identity = snapshot?.identity;
  if (typeof expectedDatabase !== 'string' || !expectedDatabase.trim() ||
      !identity || identity.database !== expectedDatabase) {
    blockers.push('database_identity_unverified');
  }
  for (const field of FALSE_FIELDS) {
    if (identity?.[field] === true) blockers.push(`unsafe_${field}`);
    else if (identity?.[field] !== false) blockers.push(`unverified_${field}`);
  }
  for (const field of TRUE_FIELDS) {
    if (identity?.[field] !== true) blockers.push(`unverified_${field}`);
  }
  const memberships = snapshot?.memberships;
  const names = new Set();
  if (!Array.isArray(memberships)) blockers.push('membership_inventory_unverified');
  else for (const row of memberships) {
    if (!row || typeof row.role !== 'string' || !row.role.trim() || names.has(row.role)) {
      blockers.push('invalid_membership_evidence');
      continue;
    }
    names.add(row.role);
  }
  if (names.size) blockers.push('unexpected_role_membership');
  return {
    ok: blockers.length === 0,
    status: blockers.length ? 'BLOCKED' : 'READY_FOR_OTHER_RELEASE_GATES',
    blockers: [...new Set(blockers)],
    database: identity?.database ?? null,
    roleChecked: APP_ROLE,
    membershipsChecked: Array.isArray(memberships) ? memberships.length : null,
    membershipSample: [...names].sort().slice(0, 20),
    caveat: 'This checks role/schema/database CREATE boundaries only. Table DML, TRUNCATE, TRIGGER, MAINTAIN, defaults, function grants, migration parity, ledger, Test exact SHA and restore are independent release gates.',
  };
}

const IDENTITY_SQL = `
SELECT current_database() AS database,
       EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = $1::name) AS app_role_exists,
       EXISTS (SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname = 'public') AS public_schema_exists,
       (SELECT rolsuper FROM pg_catalog.pg_roles WHERE rolname = $1::name) AS role_superuser,
       (SELECT rolcreatedb FROM pg_catalog.pg_roles WHERE rolname = $1::name) AS role_createdb,
       (SELECT rolcreaterole FROM pg_catalog.pg_roles WHERE rolname = $1::name) AS role_createrole,
       (SELECT rolreplication FROM pg_catalog.pg_roles WHERE rolname = $1::name) AS role_replication,
       (SELECT rolbypassrls FROM pg_catalog.pg_roles WHERE rolname = $1::name) AS role_bypassrls,
       (SELECT rolinherit FROM pg_catalog.pg_roles WHERE rolname = $1::name) AS role_inherit,
       (SELECT rolcanlogin FROM pg_catalog.pg_roles WHERE rolname = $1::name) AS role_login,
       pg_catalog.has_database_privilege($1::name, current_database(), 'CREATE') AS can_create_database,
       pg_catalog.has_schema_privilege($1::name, 'public', 'CREATE') AS can_create_public_schema,
       pg_catalog.has_schema_privilege($1::name, 'public', 'USAGE') AS can_use_public_schema`;
const MEMBERSHIP_SQL = `
SELECT granted.rolname AS role
FROM pg_catalog.pg_auth_members am
JOIN pg_catalog.pg_roles member ON member.oid = am.member
JOIN pg_catalog.pg_roles granted ON granted.oid = am.roleid
WHERE member.rolname = $1::name
ORDER BY granted.rolname`;

export async function readAppRoleBoundarySnapshot(client) {
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    await client.query("SET LOCAL statement_timeout = '10000ms'");
    const identity = (await client.query(IDENTITY_SQL, [APP_ROLE])).rows[0];
    const memberships = (await client.query(MEMBERSHIP_SQL, [APP_ROLE])).rows;
    return { identity, memberships };
  } finally {
    await client.query('ROLLBACK');
  }
}

function readDatabaseUrl(envFile) {
  const content = fs.readFileSync(envFile, 'utf8');
  const match = content.match(/^DATABASE_URL=(.*)$/m);
  if (!match) throw new Error('DATABASE_URL absent in approved operator env file');
  return match[1].trim().replace(/^['"]|['"]$/g, '');
}

async function main(args = process.argv.slice(2)) {
  if (args.length !== 4 || args[0] !== '--env-file' || !args[1].startsWith('/') ||
      args[2] !== '--expected-db' || !/^[a-z][a-z0-9_]{2,62}$/.test(args[3])) {
    throw new Error('Usage: verify-app-role-boundary.mjs --env-file /absolute/operator.env --expected-db <exact_database_name>');
  }
  const require = createRequire(new URL('../../backend/package.json', import.meta.url));
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: readDatabaseUrl(args[1]), max: 1,
    connectionTimeoutMillis: 4000, application_name: 'moneyverse_readonly_app_role_release_gate' });
  try {
    const client = await pool.connect();
    try {
      const result = evaluateAppRoleBoundary(await readAppRoleBoundarySnapshot(client), args[3]);
      process.stdout.write(JSON.stringify(result, null, 2) + '\n');
      if (!result.ok) process.exitCode = 2;
      return result;
    } finally { client.release(); }
  } finally { await pool.end(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    process.stderr.write(JSON.stringify({ status: 'BLOCKED', reason: error.code ?? 'evidence_unavailable' }) + '\n');
    process.exitCode = 2;
  });
}
