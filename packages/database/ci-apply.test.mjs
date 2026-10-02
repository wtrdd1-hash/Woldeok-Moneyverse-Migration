import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listMigrationFiles, requiredDatabaseEnv, sha256File } from './ci-apply.mjs';

test('lists numbered SQL migrations in deterministic order', () => {
  const dir = mkdtempSync(join(tmpdir(), 'moneyverse-migrations-'));
  try {
    writeFileSync(join(dir, '010-z.sql'), 'select 10;\n');
    writeFileSync(join(dir, '002-a.sql'), 'select 2;\n');
    writeFileSync(join(dir, 'README.md'), 'ignore');
    assert.deepEqual(listMigrationFiles(dir).map((p) => p.split('/').pop()), ['002-a.sql', '010-z.sql']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('hashes migration bytes exactly', () => {
  const dir = mkdtempSync(join(tmpdir(), 'moneyverse-migration-hash-'));
  try {
    const file = join(dir, '002-a.sql');
    writeFileSync(file, 'select 2;\n');
    assert.equal(sha256File(file), 'ac4396cdee0295db27f816dc31134189999d0071663e618f4957bc23edb584d7');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('requires all CI database credentials without exposing values', () => {
  assert.throws(() => requiredDatabaseEnv({ PGHOST: 'localhost' }), /PGPORT is required/);
  const env = {
    PGHOST: 'localhost', PGPORT: '5432', PGUSER: 'migrator',
    PGPASSWORD: 'secret', PGDATABASE: 'ci', APP_DB_PASSWORD: 'app-secret',
  };
  assert.deepEqual(requiredDatabaseEnv(env), {
    PGHOST: 'localhost', PGPORT: '5432', PGUSER: 'migrator',
    PGDATABASE: 'ci', APP_DB_PASSWORD: 'app-secret',
  });
});
