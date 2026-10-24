import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const legacy = resolve(dirname(fileURLToPath(import.meta.url)), 'backup-r2-free.sh');

test('legacy 04:00 backup entrypoint fails closed before database, filesystem dump, or R2 access', () => {
  const root = mkdtempSync(join(tmpdir(), 'moneyverse-legacy-backup-'));
  const bin = join(root, 'bin');
  const backups = join(root, 'backups');
  const invoked = join(root, 'invoked');
  mkdirSync(bin);
  mkdirSync(backups);
  for (const command of ['sudo', 'docker', 'aws', 'pg_dump']) {
    writeFileSync(join(bin, command), `#!/bin/sh\necho ${command} >> "$BACKUP_TEST_INVOKED"\nexit 0\n`, { mode: 0o755 });
  }
  try {
    const result = spawnSync('bash', [legacy], {
      env: {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        BACKUP_TEST_INVOKED: invoked,
        BACKUP_DIR: backups,
        DB_CONTAINER: 'not-a-real-db',
        DB_NAME: 'not-a-real-db',
        DB_USER: 'not-a-real-user',
        R2_BUCKET: 'not-a-real-bucket',
        R2_ENDPOINT: 'https://example.invalid',
      },
      encoding: 'utf8',
      timeout: 5000,
    });
    assert.equal(result.signal, null, `legacy script timed out: ${result.stderr}`);
    assert.notEqual(result.status, 0, 'legacy backup must refuse execution');
    assert.match(result.stderr, /disabled|retired|blocked/i);
    assert.equal(existsSync(invoked), false, existsSync(invoked) ? readFileSync(invoked, 'utf8') : '');
    assert.deepEqual(readdirSync(backups), []);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
