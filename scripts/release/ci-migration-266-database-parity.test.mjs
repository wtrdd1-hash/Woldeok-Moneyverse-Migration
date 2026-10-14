import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
const migration = readFileSync(
  new URL('../../packages/database/migrations/266-enterprise-security-and-performance-indices.sql', import.meta.url),
  'utf8',
);

test('CI database identity matches the immutable migration 266 target', () => {
  const targetNames = [...migration.matchAll(/ALTER DATABASE\s+([a-z][a-z0-9_]*)\s+SET\s+/gim)]
    .map((match) => match[1]);

  const postgresDb = workflow.match(/^\s+POSTGRES_DB:\s+([a-z][a-z0-9_]*)\s*$/m)?.[1];
  const pgDatabase = workflow.match(/^\s+PGDATABASE:\s+([a-z][a-z0-9_]*)\s*$/m)?.[1];
  assert.ok(postgresDb, 'CI workflow must define POSTGRES_DB');
  assert.equal(pgDatabase, postgresDb, 'migration runner DB must match PostgreSQL service DB');

  const health = workflow.match(/--health-cmd\s+"([^"]+)"/)?.[1];
  assert.ok(health?.includes(`-d ${postgresDb}`), 'PostgreSQL health check must use the same DB');

  for (const variable of ['DATABASE_URL', 'MIGRATOR_DATABASE_URL']) {
    const url = workflow.match(new RegExp(`^\\s+${variable}:\\s+(\\S+)\\s*$`, 'm'))?.[1];
    assert.ok(url, `${variable} must be configured`);
    assert.equal(new URL(url).pathname, `/${postgresDb}`, `${variable} must use the same DB`);
  }

  // migration 266 verification:
  // If migration 266 uses dynamic current_database() via \gexec, it is database-portable across environments.
  // Otherwise, ensure hardcoded database name matches the CI configured database.
  const usesCurrentDatabase = migration.includes('current_database()') && migration.includes('\\gexec');
  if (usesCurrentDatabase) {
    assert.ok(migration.includes('ALTER DATABASE %I SET statement_timeout'), 'migration 266 must configure statement_timeout');
    assert.ok(migration.includes('ALTER DATABASE %I SET idle_in_transaction_session_timeout'), 'migration 266 must configure idle_in_transaction_session_timeout');
  } else {
    assert.ok(targetNames.length > 0, 'migration 266 must contain an ALTER DATABASE target');
    assert.equal(new Set(targetNames).size, 1, 'migration 266 targets must agree');
    assert.equal(targetNames[0], postgresDb, 'hardcoded migration 266 database target must match CI database');
  }
});
