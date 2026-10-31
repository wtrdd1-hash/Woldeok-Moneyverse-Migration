import { describe, expect, it } from 'vitest';
import { parseBankLoans, bankLoanStatus } from './bank-loan-status';
const loan = { loanId: '22222222-2222-4222-8222-222222222222', principalAmount: '900719925474099312345', interestAmount: '0', outstandingAmount: '900719925474099312345', status: 'overdue', issuedAt: '2026-10-30T00:00:00.000Z', repaidAt: null };
describe('verified bank loan status contract', () => {
  it('accepts exact owner loan amounts and matching statuses', () => {
    expect(parseBankLoans({ loans: [loan] }, 'overdue')).toEqual([loan]);
    expect(parseBankLoans({ loans: [] }, 'all')).toEqual([]);
  });
  it('rejects mismatched, duplicate, malformed, over-limit and unsafe monetary data', () => {
    for (const payload of [{ loans: [loan] }, { loans: [loan, loan] }, { loans: [{ ...loan, principalAmount: Number.MAX_SAFE_INTEGER + 2 }] }, { loans: [{ ...loan, outstandingAmount: '-1' }] }, { loans: [{ ...loan, issuedAt: 'not-a-date' }] }, { loans: [{ ...loan, status: 'repaid' }] }, { loans: Array(21).fill(loan) }, { loans: null }]) {
      expect(parseBankLoans(payload, 'active')).toBeNull();
    }
  });
  it('never treats malformed search filters as trusted backend parameters', () => {
    expect(bankLoanStatus('active')).toBe('active');
    expect(bankLoanStatus(['active', 'repaid'])).toBe('all');
    expect(bankLoanStatus('active&admin=1')).toBe('all');
  });
});
