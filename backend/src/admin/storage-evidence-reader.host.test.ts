import { execFileSync } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { chmodSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { readVerifiedStorageSnapshot } from './storage-evidence-reader';

function hostPrivilegedCollectorAvailable(): boolean {
  try {
    return process.platform === 'linux' &&
      execFileSync('sudo', ['-n', 'readlink', '/proc/1/ns/mnt'], { timeout: 1000 }).toString().startsWith('mnt:');
  } catch {
    return false;
  }
}

describe.skipIf(!hostPrivilegedCollectorAvailable())('signed host collector → backend verifier', () => {
  it('accepts a fresh signed ROOT/DATA snapshot and rejects a modified signature', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mv-host-storage-e2e-'));
    const privateFile = join(dir, 'private.pem');
    const publicFile = join(dir, 'public.pem');
    const evidenceFile = join(dir, 'evidence.json');
    const { privateKey, publicKey } = generateKeyPairSync('ed25519');
    try {
      writeFileSync(privateFile, privateKey.export({ type: 'pkcs8', format: 'pem' }));
      chmodSync(privateFile, 0o600);
      writeFileSync(publicFile, publicKey.export({ type: 'spki', format: 'pem' }));
      process.env.MONEYVERSE_STORAGE_PUBLIC_KEY_FILE = publicFile;
      process.env.MONEYVERSE_STORAGE_EVIDENCE_FILE = evidenceFile;
      execFileSync('sudo', ['-n', 'env', `MONEYVERSE_STORAGE_PRIVATE_KEY_FILE=${privateFile}`, `MONEYVERSE_STORAGE_EVIDENCE_FILE=${evidenceFile}`,
        process.execPath, join(process.cwd(), '../scripts/ops/collect-storage-headroom.mjs')], { timeout: 2000 });
      const verified = readVerifiedStorageSnapshot();
      expect(verified.mounts.map((row) => row.mountAlias)).toEqual(['ROOT', 'DATA']);
      expect(verified.mounts[1]?.availableBytes).toMatch(/^[0-9]+$/);
      const doc = JSON.parse(readFileSync(evidenceFile, 'utf8')) as { signature: string };
      doc.signature = '0'.repeat(128);
      writeFileSync(`${evidenceFile}.tampered`, JSON.stringify(doc));
      renameSync(`${evidenceFile}.tampered`, evidenceFile);
      expect(() => readVerifiedStorageSnapshot()).toThrow();
    } finally {
      delete process.env.MONEYVERSE_STORAGE_PUBLIC_KEY_FILE;
      delete process.env.MONEYVERSE_STORAGE_EVIDENCE_FILE;
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
