#!/usr/bin/env node
/**
 * Read-only pre-migration gate. Compare effective application and migrator
 * connection targets without printing URLs, usernames, passwords or DB names.
 * Run on the target host against the active backend's EnvironmentFiles BEFORE
 * any Test migration. A PASS is not proof of permissions or schema parity.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const KEYS = new Set(['DATABASE_URL', 'MIGRATOR_DATABASE_URL']);
const OVERRIDES = new Set(['host', 'hostaddr', 'port', 'dbname', 'service', 'servicefile']);

export function mergeDatabaseEnvFiles(texts) {
  if (!Array.isArray(texts) || texts.length === 0) throw new Error('missing environment files');
  const result = {};
  for (const text of texts) {
    if (typeof text !== 'string') throw new Error('invalid environment file');
    const seen = new Set();
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const match = /^(?:export\s+)?([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/.exec(trimmed);
      if (!match || !KEYS.has(match[1])) continue;
      const key = match[1];
      if (seen.has(key)) throw new Error('duplicate database connection variable in one environment file');
      seen.add(key);
      let value = match[2].trim();
      if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  }
  return result;
}

function target(raw) {
  if (typeof raw !== 'string' || !raw || /[\u0000-\u001f\u007f]/.test(raw)) return null;
  try {
    const url = new URL(raw);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username ||
      !url.pathname || url.pathname === '/' || url.hash || url.hostname.includes(',')) return null;
    for (const key of url.searchParams.keys()) {
      if (OVERRIDES.has(key.toLowerCase())) return null;
    }
    const db = decodeURIComponent(url.pathname.slice(1));
    if (!db || db.includes('/') || db.includes('\0')) return null;
    return { host: url.hostname.toLowerCase(), port: url.port || '5432', database: db, role: decodeURIComponent(url.username) };
  } catch {
    return null;
  }
}

export function verifyDatabaseTargetParity(env, expectedPsqlTarget) {
  const app = target(env?.DATABASE_URL);
  const migrator = target(env?.MIGRATOR_DATABASE_URL);
  const failures = [];
  if (!app) failures.push('app_database_url_missing_or_invalid');
  if (!migrator) failures.push('migrator_database_url_missing_or_invalid');
  if (app && migrator) {
    for (const field of ['host', 'port', 'database']) {
      if (app[field] !== migrator[field]) failures.push(`database_target_${field}_mismatch`);
    }
    if (app.role === migrator.role) failures.push('database_role_not_separated');
    if (expectedPsqlTarget) {
      for (const field of ['host', 'port', 'database', 'role']) {
        const expected = expectedPsqlTarget[field];
        if (typeof expected !== 'string' || !expected || migrator[field] !== expected) {
          failures.push(`psql_target_${field}_mismatch`);
        }
      }
    }
  }
  return { ok: failures.length === 0, failures };
}

export function main(args = process.argv.slice(2)) {
  if (!args.length || args.length % 2 !== 0 || args.some((part, i) => i % 2 === 0 && part !== '--source-env')) {
    throw new Error('usage: verify-test-migrator-target.mjs --source-env <trusted-backend-env> [--source-env <override-env>]');
  }
  const files = args.filter((_, i) => i % 2 === 1);
  const verdict = verifyDatabaseTargetParity(mergeDatabaseEnvFiles(files.map((file) => readFileSync(file, 'utf8'))));
  process.stdout.write(JSON.stringify({ gate: 'test_migrator_database_target', ...verdict }) + '\n');
  if (!verdict.ok) process.exitCode = 1;
  return verdict;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try { main(); } catch {
    process.stderr.write('BLOCKED: missing or invalid Test backend environment evidence\n');
    process.exitCode = 1;
  }
}
