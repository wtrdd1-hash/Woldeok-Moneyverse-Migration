import { describe, expect, it } from 'vitest';
import { bankStandingSnapshotCsv } from './bank-standing-snapshot-csv';

const sample = {
  scope: 'current_virtual_cash_deposit_only',
  source: 'bank_get_my_standing',
  generatedAt: '2026-10-26T02:30:00.000Z',
  cashBalanceWld: '9'.repeat(38),
  depositBalanceWld: '200',
  unclaimedInterestEstimateWld: '0',
};

describe('virtual bank snapshot CSV', () => {
  it('preserves 38-digit integer strings with BOM and explicit virtual/unpaid status', () => {
    const csv = bankStandingSnapshotCsv(sample);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('9'.repeat(38));
    expect(csv).toContain('2026-10-26T02:30:00.000Z');
    expect(csv).toContain('Unclaimed interest is an estimate, not a payout');
    expect(csv).toContain('\r\n');
    expect(csv).not.toContain('undefined');
  });

  it.each([
    null,
    [],
    {},
    { ...sample, cashBalanceWld: '=2+2' },
    { ...sample, depositBalanceWld: 200 },
    { ...sample, unclaimedInterestEstimateWld: '-1' },
    { ...sample, scope: 'all_transactions' },
    { ...sample, generatedAt: 'bad' },
  ])('rejects partial/unsafe data %j without returning bytes', (data) => {
    expect(() => bankStandingSnapshotCsv(data)).toThrow();
  });
});
