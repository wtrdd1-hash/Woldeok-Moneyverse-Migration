import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
const migration = readFileSync(
  new URL('../../packages/database/migrations/266-enterprise-security-and-performance-indices.sql', import.meta.url),
  'utf8',
);

test('CI database identity matches the immutable migration 266 target', () => {
  const targetNames = [...migration.matchAll(/^ALTER DATABASE\s+([a-z][a-z0-9_]*)\s+SET\s+/gim)]
    .map((match) => match[1]);
  assert.ok(targetNames.length > 0, 'migration 266 must contain an ALTER DATABASE target');
  assert.equal(new Set(targetNames).size, 1, 'migration 266 targets must agree');

  const expected = targetNames[0];
  const postgresDb = workflow.match(/^\s+POSTGRES_DB:\s+([a-z][a-z0-9_]*)\s*$/m)?.[1];
  const pgDatabase = workflow.match(/^\s+PGDATABASE:\s+([a-z][a-z0-9_]*)\s*$/m)?.[1];
  assert.equal(postgresDb, expected, 'PostgreSQL service DB must match migration 266');
  assert.equal(pgDatabase, expected, 'migration runner DB must match migration 266');

  const health = workflow.match(/--health-cmd\s+"([^"]+)"/)?.[1];
  assert.ok(health?.includes(`-d ${expected}`), 'PostgreSQL health check must use the same DB');

  for (const variable of ['DATABASE_URL', 'MIGRATOR_DATABASE_URL']) {
    const url = workflow.match(new RegExp(`^\\s+${variable}:\\s+(\\S+)\\s*$`, 'm'))?.[1];
    assert.ok(url, `${variable} must be configured`);
    assert.equal(new URL(url).pathname, `/${expected}`, `${variable} must use the same DB`);
  }
});
