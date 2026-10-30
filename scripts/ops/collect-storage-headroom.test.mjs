import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';

const script = new URL('./collect-storage-headroom.mjs', import.meta.url).pathname;

function canRunHostCollector() {
  try {
    return process.platform === 'linux' && execFileSync('sudo', ['-n', 'readlink', '/proc/1/ns/mnt'], { timeout: 1000 }).toString().startsWith('mnt:');
  } catch { return false; }
}

test('host-only collector signs fixed ROOT/DATA statfs snapshot without leaking raw paths', { skip: !canRunHostCollector() }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'mv-storage-proof-'));
  try {
    const keyFile = join(dir, 'key');
    const evidenceFile = join(dir, 'snapshot.json');
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    writeFileSync(keyFile, privateKey.export({ type: 'pkcs8', format: 'pem' }));
    chmodSync(keyFile, 0o600);
    execFileSync('sudo', ['-n', 'env', `MONEYVERSE_STORAGE_PRIVATE_KEY_FILE=${keyFile}`, `MONEYVERSE_STORAGE_EVIDENCE_FILE=${evidenceFile}`, process.execPath, script], { timeout: 2_000 });
    const doc = JSON.parse(readFileSync(evidenceFile, 'utf8'));
    assert.equal(doc.payload.sourceKind, 'HOST_SIGNED');
    assert.deepEqual(doc.payload.mounts.map((row) => row.mountAlias), ['ROOT', 'DATA']);
    assert.ok(verify(null, Buffer.from(JSON.stringify(doc.payload)), publicKey, Buffer.from(doc.signature, 'hex')));
    for (const row of doc.payload.mounts) {
      assert.ok(BigInt(row.bavail) <= BigInt(row.bfree));
      assert.ok(BigInt(row.bfree) <= BigInt(row.blocks));
    }
    assert.ok(!JSON.stringify(doc).includes('/srv/moneyverse-data'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
