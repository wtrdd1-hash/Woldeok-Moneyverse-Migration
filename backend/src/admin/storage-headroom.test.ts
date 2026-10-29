import { generateKeyPairSync, sign } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyStorageEvidence } from './storage-headroom';

const { privateKey, publicKey } = generateKeyPairSync('ed25519');
const publicPem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
const bootId = '3f9d0c0e-a6c2-4e8b-8c52-5b4d26f18e22';
const mountNamespace = 'mnt:[4026531841]';
const now = Date.parse('2026-10-30T00:00:00.000Z');
const mount = (mountAlias: string, bavail = '1024') => ({
  mountAlias, blocks: '10000', bfree: '2000', bavail, bsize: '4096', files: '20000', ffree: '1000',
});
const payload = () => ({
  schemaVersion: 1, sourceKind: 'HOST_SIGNED', bootId, mountNamespace,
  observedAt: new Date(now - 10_000).toISOString(), sequence: '12345',
  mounts: [mount('ROOT', '800'), mount('DATA', '1024')],
});
const signed = (data: ReturnType<typeof payload>) => ({
  payload: data,
  signature: sign(null, Buffer.from(JSON.stringify(data)), privateKey).toString('hex'),
});
const check = (doc: unknown, at = now) =>
  verifyStorageEvidence(doc, { publicKey: publicPem, bootId, mountNamespace, now: at });

describe('signed host storage evidence', () => {
  it('reports df-compatible used% and unprivileged available bytes, not reserved blocks', () => {
    const result = check(signed(payload()));
    expect(result.status).toBe('VERIFIED');
    expect(result.mounts).toHaveLength(2);
    expect(result.mounts[0]).toMatchObject({ mountAlias: 'ROOT', usedBytes: '32768000', availableBytes: '3276800', usedPercent: 91, severity: 'EMERGENCY' });
    expect(result.mounts[1]?.inodeAvailable).toBe('1000');
    expect(JSON.stringify(result)).not.toContain(bootId);
  });

  it('rejects forged signatures, wrong boot/namespace and stale/future snapshots', () => {
    const original = signed(payload());
    expect(() => check({ ...original, signature: '0'.repeat(128) })).toThrow();
    expect(() => check(signed({ ...payload(), bootId: 'wrong' }))).toThrow();
    expect(() => check(signed({ ...payload(), mountNamespace: 'mnt:[1]' }))).toThrow();
    expect(() => check(signed({ ...payload(), observedAt: new Date(now - 121_000).toISOString() }))).toThrow();
    expect(() => check(signed({ ...payload(), observedAt: new Date(now + 6_000).toISOString() }))).toThrow();
  });

  it('fails closed on a filesystem with no allocatable or used blocks', () => {
    const noHeadroom = { ...mount('ROOT', '0'), blocks: '10000', bfree: '10000' };
    expect(check(signed({ ...payload(), mounts: [noHeadroom, mount('DATA')] })).mounts[0]?.severity).toBe('EMERGENCY');
  });

  it('rejects a signed sequence older than the last accepted host snapshot', () => {
    expect(() => verifyStorageEvidence(signed(payload()), { publicKey: publicPem, bootId, mountNamespace, now, minimumSequence: 12346n })).toThrow();
  });

  it('rejects extra mounts, duplicated aliases, negative counts, over-allocated blocks and invalid keys', () => {
    expect(() => check(signed({ ...payload(), mounts: [mount('ROOT'), mount('ROOT')] }))).toThrow();
    expect(() => check(signed({ ...payload(), mounts: [mount('ROOT'), mount('DATA'), mount('OTHER')] }))).toThrow();
    expect(() => check(signed({ ...payload(), mounts: [mount('ROOT', '-1'), mount('DATA')] }))).toThrow();
    expect(() => check(signed({ ...payload(), mounts: [mount('ROOT', '99999'), mount('DATA')] }))).toThrow();
    expect(() => verifyStorageEvidence(signed(payload()), { publicKey: 'invalid', bootId, mountNamespace, now })).toThrow();
  });
});
