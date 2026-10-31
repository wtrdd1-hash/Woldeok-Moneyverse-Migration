import assert from 'node:assert/strict';
import test from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { verifyDatabaseTargetParity, mergeDatabaseEnvFiles } from './verify-test-migrator-target.mjs';

const app = 'postgresql://moneyverse_app:secret@app-db.internal:5432/woldeok_test?sslmode=require';
const migrator = 'postgresql://moneyverse_migrator:another-secret@app-db.internal:5432/woldeok_test?sslmode=require';

test('accepts one identical database target with distinct least-privilege roles', () => {
  assert.deepEqual(verifyDatabaseTargetParity({ DATABASE_URL: app, MIGRATOR_DATABASE_URL: migrator }), { ok: true, failures: [] });
});

test('rejects stale database name, host or port independently without leaking credentials', () => {
  for (const [field, url] of [
    ['database', 'postgresql://moneyverse_migrator:secret@app-db.internal:5432/woldeok_old'],
    ['host', 'postgresql://moneyverse_migrator:secret@old-db.internal:5432/woldeok_test'],
    ['port', 'postgresql://moneyverse_migrator:secret@app-db.internal:5433/woldeok_test'],
  ]) {
    const verdict = verifyDatabaseTargetParity({ DATABASE_URL: app, MIGRATOR_DATABASE_URL: url });
    assert.deepEqual(verdict, { ok: false, failures: [`database_target_${field}_mismatch`] });
    assert.ok(!JSON.stringify(verdict).includes('secret'));
  }
});

test('rejects missing or invalid URL and connection target override parameters', () => {
  for (const url of [undefined, '', 'not-a-url', 'postgresql://x:pass@db:5432/name?host=elsewhere', 'postgresql://x:pass@db:5432/name?service=other']) {
    assert.equal(verifyDatabaseTargetParity({ DATABASE_URL: app, MIGRATOR_DATABASE_URL: url }).ok, false);
  }
});

test('rejects identical app and migrator database role even if target matches', () => {
  assert.deepEqual(verifyDatabaseTargetParity({ DATABASE_URL: app, MIGRATOR_DATABASE_URL: app }), { ok: false, failures: ['database_role_not_separated'] });
});

test('accepts default 5432 equivalence, ignores credentials and sslmode but not target', () => {
  const verdict = verifyDatabaseTargetParity({
    DATABASE_URL: 'postgres://moneyverse_app:a@db.internal/woldeok_test',
    MIGRATOR_DATABASE_URL: 'postgresql://moneyverse_migrator:b@db.internal:5432/woldeok_test?sslmode=disable',
  });
  assert.equal(verdict.ok, true);
});

test('last environment file wins, duplicate keys in one file are rejected', () => {
  const env = mergeDatabaseEnvFiles([
    `DATABASE_URL=${app}\nMIGRATOR_DATABASE_URL=postgresql://wrong:pw@old:5432/old\n`,
    `MIGRATOR_DATABASE_URL=${migrator}\n`,
  ]);
  assert.equal(verifyDatabaseTargetParity(env).ok, true);
  assert.throws(() => mergeDatabaseEnvFiles([`DATABASE_URL=${app}\nDATABASE_URL=${app}\n`]), /duplicate/i);
});

test('fails closed if env files are incomplete and never returns connection strings', () => {
  const env = mergeDatabaseEnvFiles([`DATABASE_URL=${app}\n`]);
  const verdict = verifyDatabaseTargetParity(env);
  assert.equal(verdict.ok, false);
  assert.ok(!JSON.stringify(verdict).includes('secret'));
});

test('rejects multiple host targets and malformed escaped database names', () => {
  for (const raw of [
    'postgresql://migrator:pw@db1,db2:5432/woldeok_test',
    'postgresql://migrator:pw@db1:5432/%00',
    'postgresql://migrator:pw@db1:5432/woldeok_test?hostaddr=127.0.0.1',
  ]) {
    assert.equal(verifyDatabaseTargetParity({ DATABASE_URL: app, MIGRATOR_DATABASE_URL: raw }).ok, false);
  }
});

test('also rejects CI psql target that differs from both URLs', () => {
  const verdict = verifyDatabaseTargetParity({ DATABASE_URL: app, MIGRATOR_DATABASE_URL: migrator }, {
    host: 'app-db.internal', port: '5433', database: 'woldeok_old', role: 'moneyverse_migrator',
  });
  assert.deepEqual(verdict.failures, ['psql_target_port_mismatch', 'psql_target_database_mismatch']);
});


test('CLI exits nonzero for stale effective Test environment and redacts secrets', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mv-test-target-'));
  try {
    const file = join(dir, 'backend.env');
    writeFileSync(file, `DATABASE_URL=${app}\nMIGRATOR_DATABASE_URL=postgresql://moneyverse_migrator:do-not-print@old-db.internal:5433/woldeok_old\n`);
    const result = spawnSync(process.execPath, [new URL('./verify-test-migrator-target.mjs', import.meta.url).pathname, '--source-env', file], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stdout, /database_target_database_mismatch/);
    assert.doesNotMatch(result.stdout + result.stderr, /do-not-print|secret|woldeok_old|old-db\.internal/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
