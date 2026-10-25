import { describe, expect, it } from 'vitest';
import { businessOwnershipCsv } from './business-ownership-csv';
const row = {
  ownershipId: '11111111-1111-4111-8111-111111111111',
  businessTypeId: '22222222-2222-4222-8222-222222222222',
  symbol: 'FARM', name: 'Smart Farm', purchaseCost: '9007199254740993',
  dailyRevenue: '100000000000000000', dailyOperatingCost: '50000000000000000',
  purchasedAt: '2026-10-01T00:00:00Z', lastSettlementDate: null,
  isSettledToday: false, status: 'active',
};
const data = { scope: 'current_100_max', businesses: [row] };
describe('virtual business holdings CSV', () => {
  it('preserves large integer strings and labels snapshot as non-ledger proof', () => {
    const csv = businessOwnershipCsv(data);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('9007199254740993');
    expect(csv).toContain('100000000000000000');
    expect(csv).toContain('Current virtual holdings snapshot only');
  });
  it('neutralizes formulas, newlines and bidi controls before quoting', () => {
    const csv = businessOwnershipCsv({ ...data, businesses: [{ ...row, name: '=HYPERLINK("evil")\r\n+SUM(1)\u202E' }] });
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toContain('\r\n+SUM');
    expect(csv).not.toContain('\u202E');
  });
  it('rejects incomplete, malformed, numeric and oversized payloads without emitting bytes', () => {
    for (const invalid of [null, {}, { ...data, scope: 'all_history' },
      { ...data, businesses: Array.from({ length: 101 }, () => row) },
      { ...data, businesses: [{ ...row, purchaseCost: Number("9007199254740993") }] },
      { ...data, businesses: [{ ...row, dailyRevenue: '-1' }] },
      { ...data, businesses: [{ ...row, purchasedAt: 'yesterday' }] },
      { ...data, businesses: [{ ...row, ownershipId: 'bad' }] },
      { ...data, businesses: [{ ...row, status: '' }] },
    ]) expect(() => businessOwnershipCsv(invalid)).toThrow();
  });
});
