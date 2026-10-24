import { describe, expect, it } from 'vitest';
import { backupStatusLabel, backupRetentionLabel } from './backup-status';

describe('admin backup inventory trust labels', () => {
  it('never calls an unverified legacy SQL file a verified backup', () => {
    expect(backupStatusLabel('PENDING', true)).toBe('Unverified');
    expect(backupStatusLabel('PENDING', false)).toBe('검증되지 않음');
  });

  it('does not invent a legacy retention policy', () => {
    expect(backupRetentionLabel(0, true)).toBe('Unverified');
    expect(backupRetentionLabel(0, false)).toBe('검증되지 않음');
    expect(backupRetentionLabel(14, true)).toBe('14 days');
  });

  it('reserves verified label for explicit verified status', () => {
    expect(backupStatusLabel('VERIFIED', true)).toBe('Verified');
    expect(backupStatusLabel('VERIFIED', false)).toBe('검증됨');
  });
});
