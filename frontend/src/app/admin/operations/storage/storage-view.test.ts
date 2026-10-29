import { describe, expect, it } from 'vitest';
import { formatStorageBytes, validateStorageSnapshot } from './storage-view';

const mount = (mountAlias: string) => ({ mountAlias, totalBytes: '10000000000', usedBytes: '8000000000', availableBytes: '1000000000', usedPercent: 89, inodeAvailable: '100', severity: 'EMERGENCY' });
const evidence = { status: 'VERIFIED', sourceKind: 'HOST_SIGNED', freshness: 'FRESH', observedAt: '2026-10-30T00:00:00.000Z', mounts: [mount('ROOT'), mount('DATA')] };

describe('storage headroom admin view', () => {
  it('accepts only a complete two-mount signed response', () => {
    expect(validateStorageSnapshot(evidence, Date.parse('2026-10-30T00:00:30.000Z'))?.mounts).toHaveLength(2);
    expect(validateStorageSnapshot({ ...evidence, mounts: [mount('ROOT')] })).toBeNull();
    expect(validateStorageSnapshot({ ...evidence, mounts: [mount('ROOT'), mount('ROOT')] })).toBeNull();
    expect(validateStorageSnapshot({ ...evidence, status: 'UNKNOWN' })).toBeNull();
    expect(validateStorageSnapshot({ ...evidence, mounts: [mount('ROOT'), { ...mount('DATA'), usedPercent: -1 }] })).toBeNull();
    expect(validateStorageSnapshot({ ...evidence, mounts: [mount('ROOT'), { ...mount('DATA'), availableBytes: 'NaN' }] })).toBeNull();
  });

  it('formats large byte amounts without floating point precision loss', () => {
    expect(formatStorageBytes('1073741824')).toBe('1.0 GiB');
    expect(formatStorageBytes('9007199254740993')).toMatch(/GiB$/);
  });
});
