import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../../packages/database/migrations/266-enterprise-security-and-performance-indices.sql', import.meta.url), 'utf8');

test('CI database identity matches immutable migration 266', () => {
  const targets = [...migration.matchAll(/^ALTER DATABASE\\s+([a-z][a-z0-9_]*)\\s+SET\\s+/gim)].map((m) => m[1]);
  assert.ok(targets.length > 0, 'migration 266 must contain ALTER DATABASE');
  assert.equal(new Set(targets).size, 1, 'migration 266 database targets must agree');
  const expected = targets[0];
  const serviceDb = workflow.match(/^\\s+POSTGRES_DB:\\s+([a-z][a-z0-9_]*)\\s*$/m)?.[1];
  const migrationDb = workflow.match(/^\\s+PGDATABASE:\\s+([a-z][a-z0-9_]*)\\s*$/m)?.[1];
  assert.equal(serviceDb, expected, 'CI service database');
  assert.equal(migrationDb, expected, 'CI migration database');
  assert.match(workflow, new RegExp('--health-cmd\\s+"[^"]*-d '+expected+'"'));
  for (const variable of ['DATABASE_URL', 'MIGRATOR_DATABASE_URL']) {
    const value = workflow.match(new RegExp('^\\s+'+variable+':\\s+(\\S+)\\s*$', 'm'))?.[1];
    assert.ok(value, variable+' must exist');
    assert.equal(new URL(value).pathname, '/'+expected, variable+' database');
  }
});
