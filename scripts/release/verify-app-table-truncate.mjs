#!/usr/bin/env node
/**
 * Fail-closed, read-only release prerequisite for effective TRUNCATE rights on
 * existing public tables. Future default ACLs are checked independently.
 * This gate never changes privileges, schema or financial state.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const APP_ROLE = 'moneyverse_app';
const REQUIRED = Object.freeze([
  'account_balances', 'audit_logs', 'ledger_postings', 'ledger_transactions', 'users',
]);

export function evaluateAppTableTruncate(snapshot, expectedDatabase) {
  const blockers = [];
  const identity = snapshot?.identity;
  if (typeof expectedDatabase !== 'string' || !expectedDatabase.trim() ||
      !identity || identity.database !== expectedDatabase) {
    blockers.push('database_identity_unverified');
  }
  if (identity?.app_role_exists !== true) blockers.push('app_role_unverified');
  const tables = snapshot?.tables;
  if (!Array.isArray(tables) || !Number.isSafeInteger(identity?.table_count) ||
      identity.table_count < REQUIRED.length || tables.length !== identity.table_count) {
    blockers.push('table_inventory_incomplete');
  }
  const seen = new Set();
  const unsafe = [];
  for (const row of Array.isArray(tables) ? tables : []) {
    if (!row || row.schema !== 'public' || typeof row.name !== 'string' ||
        !row.name.trim() || typeof row.can_truncate !== 'boolean') {
      blockers.push('invalid_table_privilege_evidence');
      continue;
    }
    const key = `${row.schema}.${row.name}`;
    if (seen.has(key)) blockers.push('duplicate_table_privilege_evidence');
    seen.add(key);
    if (row.can_truncate) unsafe.push(key);
  }
  for (const name of REQUIRED) {
    if (!seen.has(`public.${name}`)) blockers.push(`missing_protected_table:${name}`);
  }
  if (unsafe.length) blockers.push('app_can_truncate_public_tables');
  return {
    ok: blockers.length === 0,
    status: blockers.length ? 'BLOCKED' : 'READY_FOR_OTHER_RELEASE_GATES',
    blockers: [...new Set(blockers)],
    database: identity?.database ?? null,
    roleChecked: APP_ROLE,
    scannedTables: Array.isArray(tables) ? tables.length : 0,
    unsafeTables: unsafe.length,
    unsafeSample: unsafe.sort().slice(0, 20),
    caveat: 'Existing-table TRUNCATE is only one prerequisite. Default ACLs, DML, migration checksums, ledger, Test exact SHA, backup restore and Production gates remain independent.',
  };
}

const IDENTITY_SQL = `
SELECT current_database() AS database,
       EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = 'moneyverse_app') AS app_role_exists,
       (SELECT COUNT(*)::int FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind IN ('r','p')) AS table_count`;
const TABLES_SQL = `
SELECT n.nspname AS schema, c.relname AS name,
       pg_catalog.has_table_privilege($1::name, c.oid, 'TRUNCATE') AS can_truncate
FROM pg_catalog.pg_class c
JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('r','p')
ORDER BY n.nspname, c.relname`;

export async function readAppTableTruncateSnapshot(client) {
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  try {
    await client.query("SET LOCAL statement_timeout = '10000ms'");
    const identity = (await client.query(IDENTITY_SQL)).rows[0];
    const tables = (await client.query(TABLES_SQL, [APP_ROLE])).rows;
    return { identity, tables };
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
    throw new Error('Usage: verify-app-table-truncate.mjs --env-file /absolute/operator.env --expected-db <exact_database_name>');
  }
  const require = createRequire(new URL('../../backend/package.json', import.meta.url));
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: readDatabaseUrl(args[1]), max: 1,
    connectionTimeoutMillis: 4000, application_name: 'moneyverse_readonly_app_truncate_release_gate' });
  try {
    const client = await pool.connect();
    try {
      const result = evaluateAppTableTruncate(await readAppTableTruncateSnapshot(client), args[3]);
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
