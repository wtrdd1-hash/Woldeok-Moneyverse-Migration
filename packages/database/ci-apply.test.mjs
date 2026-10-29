import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyFreshCiDatabase, assertContiguousMigrationSequence, listMigrationFiles, requiredDatabaseEnv, sha256File } from './ci-apply.mjs';

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

test('fails closed on duplicate numeric migration identifiers before any SQL runs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'moneyverse-migration-collision-'));
  try {
    writeFileSync(join(dir, '291-ledger-first-citizen-dividend.sql'), 'select 1;\n');
    writeFileSync(join(dir, '291-npc-order-replay-integrity.sql'), 'select 2;\n');
    assert.throws(() => listMigrationFiles(dir), /duplicate migration number 291/i);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('requires a contiguous migration sequence from 002 before SQL execution', () => {
  assert.doesNotThrow(() => assertContiguousMigrationSequence(['002-core.sql', '003-auth.sql']));
  assert.throws(() => assertContiguousMigrationSequence([]), /missing migration 002/i);
  assert.throws(() => assertContiguousMigrationSequence(['002-core.sql', '004-skipped.sql']), /expected 003, found 004/);
  assert.throws(() => assertContiguousMigrationSequence(['003-first.sql']), /expected 002, found 003/);
});

test('refuses a collision before requesting DB credentials or creating a role', () => {
  const root = mkdtempSync(join(tmpdir(), 'moneyverse-ci-preflight-'));
  try {
    const dir = join(root, 'migrations');
    mkdirSync(dir);
    writeFileSync(join(dir, '291-a.sql'), 'select 1;\n');
    writeFileSync(join(dir, '291-b.sql'), 'select 2;\n');
    assert.throws(() => applyFreshCiDatabase(root), /duplicate migration number 291/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
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
