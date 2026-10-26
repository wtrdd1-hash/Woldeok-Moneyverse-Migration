import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  compareAppliedChecksums,
  parseAppliedRows,
  requiredReadOnlyEnv,
  readAppliedChecksums,
} from './verify-applied-checksums.mjs';

function fixture(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'mv-checksum-'));
  const name = '002-original.sql';
  const bytes = Buffer.from('select 1;\n');
  writeFileSync(join(dir, name), bytes);
  const checksum = createHash('sha256').update(bytes).digest('hex');
  try {
    return fn({ dir, name, checksum });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('accepts identical applied bytes and reports new source migrations as pending', () =>
  fixture(({ dir, name, checksum }) => {
    writeFileSync(join(dir, '003-pending.sql'), 'select 3;\n');
    const report = compareAppliedChecksums([{ filename: name, checksum }], dir);
    assert.equal(report.ok, true);
    assert.equal(report.applied, 1);
    assert.equal(report.matched, 1);
    assert.deepEqual(report.unapplied, ['003-pending.sql']);
  }));

test('rejects mutated applied SQL without rewriting history', () =>
  fixture(({ dir, name, checksum }) => {
    writeFileSync(join(dir, name), 'select 2;\n');
    const report = compareAppliedChecksums([{ filename: name, checksum }], dir);
    assert.equal(report.ok, false);
    assert.deepEqual(
      report.mismatched.map((entry) => entry.filename),
      [name],
    );
  }));

test('hashes exact bytes rather than normalizing CRLF', () =>
  fixture(({ dir, name, checksum }) => {
    writeFileSync(join(dir, name), 'select 1;\r\n');
    assert.equal(compareAppliedChecksums([{ filename: name, checksum }], dir).ok, false);
  }));

test('fails closed when applied SQL is absent, malformed or duplicate', () =>
  fixture(({ dir, name, checksum }) => {
    assert.deepEqual(
      compareAppliedChecksums([{ filename: '004-missing.sql', checksum }], dir).missing,
      ['004-missing.sql'],
    );
    assert.equal(
      compareAppliedChecksums([{ filename: '../secrets.sql', checksum }], dir).ok,
      false,
    );
    assert.equal(
      compareAppliedChecksums([{ filename: name, checksum: 'not-a-sha256' }], dir).ok,
      false,
    );
    assert.equal(
      compareAppliedChecksums(
        [
          { filename: name, checksum },
          { filename: name, checksum },
        ],
        dir,
      ).ok,
      false,
    );
    assert.equal(compareAppliedChecksums([], dir).ok, false);
  }));

test('parses only two tab-separated columns and rejects malformed DB output', () =>
  fixture(({ name, checksum }) => {
    assert.deepEqual(parseAppliedRows(name + '\t' + checksum + '\n'), [
      { filename: name, checksum },
    ]);
    assert.throws(() => parseAppliedRows('BEGIN\n' + name + '\t' + checksum), /invalid/i);
    assert.throws(() => parseAppliedRows(name + '\t' + checksum + '\textra'), /invalid/i);
  }));

test('requires explicit target identity and never logs credentials', () => {
  assert.throws(() => requiredReadOnlyEnv({ PGHOST: 'localhost' }), /PGPORT/);
  const env = requiredReadOnlyEnv({
    PGHOST: 'localhost',
    PGPORT: '5432',
    PGUSER: 'reader',
    PGDATABASE: 'fixture',
    PGPASSWORD: 'private',
    PGOPTIONS: '-c statement_timeout=1000',
  });
  assert.equal(env.PGOPTIONS.includes('default_transaction_read_only=on'), true);
  assert.equal(env.PGPASSWORD, 'private');
});

test('read-only psql runner sets transaction read-only and never executes writes', () => {
  const captured = {};
  const rows = readAppliedChecksums(
    {
      PGHOST: 'localhost',
      PGPORT: '5432',
      PGUSER: 'reader',
      PGDATABASE: 'fixture',
    },
    (bin, args, options) => {
      captured.bin = bin;
      captured.args = args;
      captured.env = options.env;
      return { status: 0, stdout: '002-original.sql\t' + 'a'.repeat(64) + '\n' };
    },
  );
  assert.equal(rows.length, 1);
  assert.equal(captured.bin, 'psql');
  assert.match(captured.env.PGOPTIONS, /default_transaction_read_only=on/);
  assert.equal(captured.args.join(' ').includes('INSERT'), false);
  assert.equal(captured.args.join(' ').includes('UPDATE'), false);
  assert.equal(captured.args.join(' ').includes('DELETE'), false);
});

test('database query failures block release without exposing driver stderr', () => {
  assert.throws(
    () =>
      readAppliedChecksums(
        {
          PGHOST: 'localhost',
          PGPORT: '5432',
          PGUSER: 'reader',
          PGDATABASE: 'fixture',
        },
        () => ({ status: 2, stderr: 'PASSWORD=sensitive' }),
      ),
    (error) => {
      assert.doesNotMatch(error.message, /sensitive/);
      return true;
    },
  );
});

test('CI executes the real DB parity test after applying migrations', () => {
  const workflow = readFileSync(new URL('../../.github/workflows/ci.yml', import.meta.url), 'utf8');
  const root = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const apply = workflow.indexOf('run: node packages/database/ci-apply.mjs');
  const suite = workflow.indexOf('run: pnpm test', apply);
  assert.ok(apply >= 0 && suite > apply);
  assert.match(workflow.slice(apply, suite), /MIGRATOR_DATABASE_URL:/);
  assert.ok(root.scripts.test.includes('packages/database/verify-applied-checksums.test.mjs'));
});

test(
  'real PostgreSQL applied migration history matches exact source bytes',
  {
    skip: !process.env.MIGRATOR_DATABASE_URL,
  },
  () => {
    const target = new URL(process.env.MIGRATOR_DATABASE_URL);
    assert.match(target.protocol, /^postgres(ql)?:$/);
    assert.ok(target.hostname && target.username && target.pathname.length > 1);
    const env = {
      ...process.env,
      PGHOST: target.hostname,
      PGPORT: target.port || '5432',
      PGUSER: decodeURIComponent(target.username),
      PGPASSWORD: decodeURIComponent(target.password),
      PGDATABASE: decodeURIComponent(target.pathname.slice(1)),
    };
    const report = compareAppliedChecksums(
      readAppliedChecksums(env),
      fileURLToPath(new URL('./migrations/', import.meta.url)),
    );
    assert.equal(report.ok, true, JSON.stringify(report));
  },
);
