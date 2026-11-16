import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';

const verifier = resolve(import.meta.dirname, 'moneyverse-backup-verify.sh.template');
function run(command, args, opts = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...opts });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, command + ' failed: ' + result.stderr);
  return result.stdout;
}
function hash(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}
function fixture({ tamperMember = false, tamperOuter = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'mv-backup-stream-test-'));
  const data = join(root, 'data');
  const bin = join(root, 'bin');
  const scratch = join(root, 'scratch');
  mkdirSync(data);
  mkdirSync(bin);
  mkdirSync(scratch);
  const key = join(root, 'test-passphrase');
  writeFileSync(key, randomBytes(32).toString('hex') + '\n', { mode: 0o600 });
  chmodSync(key, 0o600);
  const db = join(data, 'database.dump');
  const photosRaw = join(root, 'photos.raw');
  writeFileSync(db, randomBytes(3 * 1024 * 1024));
  writeFileSync(photosRaw, randomBytes(5000));
  run('zstd', ['-q', '-f', '-o', join(data, 'photos.tar.zst'), photosRaw]);
  writeFileSync(join(data, 'manifest.txt'), 'format=moneyverse-backup-v1\n');
  const members = ['database.dump', 'photos.tar.zst', 'manifest.txt'];
  const sums = members.map(name => hash(readFileSync(join(data, name))) + '  ' + name).join('\n') + '\n';
  writeFileSync(join(data, 'SHA256SUMS'), sums);
  if (tamperMember) writeFileSync(join(data, 'photos.tar.zst'), randomBytes(7000));
  const tar = join(root, 'plaintext-synthetic.tar');
  const compressed = join(root, 'synthetic.tar.zst');
  const archive = join(root, 'synthetic.tar.zst.enc');
  run('tar', ['-C', data, '-cf', tar, ...members, 'SHA256SUMS']);
  run('zstd', ['-q', '-f', '-o', compressed, tar]);
  run('openssl', ['enc', '-aes-256-cbc', '-salt', '-pbkdf2', '-iter', '200000', '-md', 'sha256',
    '-pass', 'file:' + key, '-in', compressed, '-out', archive]);
  writeFileSync(archive + '.sha256', (tamperOuter ? 'f'.repeat(64) : hash(readFileSync(archive))) +
    '  ' + basename(archive) + '\n');
  const fakeDocker = join(bin, 'docker');
  writeFileSync(fakeDocker, '#!/bin/sh\ncat >/dev/null\nexit 0\n', { mode: 0o700 });
  chmodSync(fakeDocker, 0o700);
  return {
    root, scratch, archive,
    env: { ...process.env, BACKUP_KEY_FILE: key, BACKUP_DB_CONTAINER: 'test-only',
      TMPDIR: scratch, PATH: bin + ':' + process.env.PATH }
  };
}
function verify(f) {
  return spawnSync('bash', [verifier, f.archive], { encoding: 'utf8', env: f.env });
}
test('valid encrypted archive verifies without extracting plaintext into TMPDIR', () => {
  const f = fixture();
  try {
    const r = verify(f);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, /verify: OK/);
    assert.deepEqual(readdirSync(f.scratch), []);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
test('tampered member cannot pass inner SHA256 validation', () => {
  const f = fixture({ tamperMember: true });
  try {
    const r = verify(f);
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /checksum mismatch/);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
test('outer encrypted archive integrity mismatch is rejected before decryption', () => {
  const f = fixture({ tamperOuter: true });
  try {
    const r = verify(f);
    assert.notEqual(r.status, 0);
    assert.doesNotMatch(r.stdout, /verify: OK/);
  } finally { rmSync(f.root, { recursive: true, force: true }); }
});
