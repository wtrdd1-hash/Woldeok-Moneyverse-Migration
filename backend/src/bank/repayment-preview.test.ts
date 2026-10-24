import { describe, expect, it } from 'vitest';
import { previewLoanRepayment, RepaymentPreviewError } from './repayment-preview';

const standing = {
  cash_balance: '90071992547409931234567890',
  active_loan: {
    loan_id: 'a0000000-0000-4000-8000-000000000001',
    status: 'active',
    outstanding_amount: '90071992547409931234567891',
  },
};

describe('owner-only loan repayment preview', () => {
  it('computes projected balances without floating point conversion', () => {
    expect(previewLoanRepayment(standing, '90071992547409931234567890')).toMatchObject({
      loanId: standing.active_loan.loan_id,
      requestedAmount: '90071992547409931234567890',
      effectiveAmount: '90071992547409931234567890',
      remainingCash: '0',
      remainingDebt: '1',
      canRepay: true,
      reason: 'READY',
      previewOnly: true,
      revalidateAtExecution: true,
    });
  });

  it('caps overpayment to actual outstanding amount, matching the SQL command', () => {
    expect(previewLoanRepayment({ ...standing, cash_balance: '200', active_loan: { ...standing.active_loan, outstanding_amount: '100' } }, '1000')).toMatchObject({
      requestedAmount: '1000',
      effectiveAmount: '100',
      remainingCash: '100',
      remainingDebt: '0',
      canRepay: true,
      reason: 'CAPPED_TO_OUTSTANDING',
    });
  });

  it('fails closed on insufficient cash without projecting negative balances', () => {
    expect(previewLoanRepayment({ ...standing, cash_balance: '9', active_loan: { ...standing.active_loan, outstanding_amount: '10' } }, '10')).toMatchObject({
      canRepay: false,
      reason: 'INSUFFICIENT_CASH',
      remainingCash: null,
      remainingDebt: null,
    });
  });

  it.each(['0', '-1', '1.5', '1e3', ' 1', '01', '', '9'.repeat(101)])('rejects invalid amount %s', (amount) => {
    expect(() => previewLoanRepayment(standing, amount)).toThrow(RepaymentPreviewError);
  });

  it('fails closed if the authenticated owner has no active loan', () => {
    expect(() => previewLoanRepayment({ ...standing, active_loan: null }, '10')).toThrow(RepaymentPreviewError);
  });

  it('fails closed on malformed standing rather than inventing balances', () => {
    expect(() => previewLoanRepayment({ ...standing, cash_balance: 'NaN' }, '10')).toThrow(RepaymentPreviewError);
  });

  it('never exposes unrelated account data: response contains only current standing and the active loan', () => {
    const result = previewLoanRepayment({ ...standing, other_user_id: 'secret' }, '1');
    expect(JSON.stringify(result)).not.toContain('secret');
    expect(result).not.toHaveProperty('other_user_id');
  });
});
