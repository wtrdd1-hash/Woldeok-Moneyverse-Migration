import { describe, expect, it } from 'vitest';
import { bankStatementCsv } from './bank-statement';

const snapshot = {
  currency: 'WLD' as const, cashBalance: '900719925474099312345678',
  depositBalance: '1200', unclaimedInterest: '0', activeLoanOutstanding: null,
  observedAt: '2026-10-28T07:00:00.000Z', readOnly: true as const,
};

describe('private member bank CSV snapshot', () => {
  it('exports exact integer strings and a stable, formula-safe bounded schema', () => {
    const csv = bankStatementCsv(snapshot);
    expect(csv).toContain('cash_balance,900719925474099312345678');
    expect(csv).toContain('active_loan_outstanding,');
    expect(csv).toContain('2026-10-28T07:00:00.000Z');
    expect(csv).not.toContain('undefined');
    expect(csv.split('\n').length).toBeLessThan(12);
  });
  it('fails closed for spreadsheet injection, scientific notation, or an invalid observation date', () => {
    expect(() => bankStatementCsv({ ...snapshot, cashBalance: '=HYPERLINK(1)' })).toThrow();
    expect(() => bankStatementCsv({ ...snapshot, cashBalance: '1e3' })).toThrow();
    expect(() => bankStatementCsv({ ...snapshot, observedAt: '=cmd' })).toThrow();
  });
});
