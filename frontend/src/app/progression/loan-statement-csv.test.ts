import { describe, expect, it } from 'vitest';
import { loanStatementCsv } from './loan-statement-csv';

const loan = {
  loan_id: '22222222-2222-4222-8222-222222222222',
  principal_amount: '9007199254740993',
  interest_amount: '999999999999999999',
  outstanding_amount: '9007199254741992',
  status: 'active',
  issued_at: '2026-10-01T00:00:00Z',
  repaid_at: null,
};
const data = { scope: 'recent_20_only', loans: [loan] };

describe('private virtual loan statement CSV', () => {
  it('preserves exact integer strings, timestamps, BOM and limited scope disclaimer', () => {
    const csv = loanStatementCsv(data);
    expect(csv).toContain('9007199254740993');
    expect(csv).toContain('999999999999999999');
    expect(csv).toContain('Recent 20 virtual loans only');
    expect(csv).toContain('2026-10-01T00:00:00.000Z');
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('escapes spreadsheet formulae and controls in unknown status strings', () => {
    const csv = loanStatementCsv({ ...data, loans: [{ ...loan, status: '=HYPERLINK("evil")\r\n+SUM(1)' }] });
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).not.toContain('\r\n+SUM');
  });

  it('rejects malformed, oversized, negative, numeric, or inconsistent response', () => {
    for (const bad of [
      null, {}, { ...data, scope: 'all_loans' },
      { ...data, loans: Array.from({ length: 21 }, () => loan) },
      { ...data, loans: [{ ...loan, principal_amount: Number("9007199254740993") }] },
      { ...data, loans: [{ ...loan, principal_amount: '-10' }] },
      { ...data, loans: [{ ...loan, issued_at: 'not-a-date' }] },
      { ...data, loans: [{ ...loan, loan_id: 'not-a-uuid' }] },
    ]) expect(() => loanStatementCsv(bad)).toThrow();
  });
});
