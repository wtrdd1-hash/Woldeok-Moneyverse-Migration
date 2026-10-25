import { describe, expect, it } from 'vitest';
import { loanDeadlineSnapshot, LoanDeadlineDataError } from './loan-deadline';

const now = new Date('2026-10-25T00:00:00.000Z');
const loanId = '77a071a6-a75e-4bcb-ac7e-10ae50aa86ef';
const base = {
  cash_balance: '500',
  active_loan: {
    loan_id: loanId, outstanding_amount: '1000',
    minimum_repayment: '200', status: 'active',
    maturity_at: '2026-11-25T00:00:00.000Z',
  },
};

describe('owner-scoped loan maturity and minimum cash readiness', () => {
  it('returns scheduled status for a loan more than seven days away', () => {
    expect(loanDeadlineSnapshot(base, now)).toEqual({
      hasActiveLoan: true, quoteOnly: true, observedAt: now.toISOString(),
      loanId, loanStatus: 'active', maturityAt: '2026-11-25T00:00:00.000Z',
      dueState: 'scheduled', daysUntilDue: 31, overdueDays: null,
      outstandingAmount: '1000', minimumRepayment: '200',
      cashBalance: '500', canCoverMinimum: true,
    });
  });
  it('warns about a deadline within seven days, rounding partial days up', () => {
    const result = loanDeadlineSnapshot({...base, active_loan: {...base.active_loan, maturity_at: '2026-10-26T12:00:00Z'}}, now);
    expect(result).toMatchObject({dueState: 'due_soon', daysUntilDue: 2, overdueDays: null});
  });
  it('recognizes an overdue maturity even before the DB status transition', () => {
    const result = loanDeadlineSnapshot({...base, active_loan: {...base.active_loan, maturity_at: '2026-10-22T00:00:00Z'}}, now);
    expect(result).toMatchObject({dueState: 'overdue', daysUntilDue: null, overdueDays: 3});
  });
  it('honors an overdue DB status and never calls it scheduled', () => {
    const result = loanDeadlineSnapshot({...base, active_loan: {...base.active_loan, status: 'overdue'}}, now);
    expect(result).toMatchObject({dueState: 'overdue', overdueDays: 0});
  });
  it('does not claim enough cash when minimum repayment is unaffordable', () => {
    const result = loanDeadlineSnapshot({...base, cash_balance: '199'}, now);
    expect(result).toMatchObject({cashBalance: '199', canCoverMinimum: false});
  });
  it('caps minimum at outstanding and preserves 100-digit integer strings', () => {
    const huge = '9'.repeat(100);
    const result = loanDeadlineSnapshot({
      ...base, cash_balance: huge,
      active_loan: {...base.active_loan, outstanding_amount: '100', minimum_repayment: huge},
    }, now);
    expect(result).toMatchObject({minimumRepayment: '100', cashBalance: huge, canCoverMinimum: true});
  });
  it('treats zero policy minimum as unknown readiness, not a free repayment', () => {
    const result = loanDeadlineSnapshot({
      ...base, active_loan: {...base.active_loan, minimum_repayment: '0'},
    }, now);
    expect(result).toMatchObject({minimumRepayment: '0', canCoverMinimum: null});
  });
  it('distinguishes no active loan from an unavailable DB snapshot', () => {
    expect(loanDeadlineSnapshot({cash_balance: '0', active_loan: null}, now)).toEqual({
      hasActiveLoan: false, quoteOnly: true, observedAt: now.toISOString(),
    });
    for (const bad of [null, {}, {cash_balance: '0'}, {...base, cash_balance: 'NaN'},
      {...base, active_loan: {...base.active_loan, maturity_at: 'tomorrow'}},
      {...base, active_loan: {...base.active_loan, status: 'repaid'}},
      {...base, active_loan: {...base.active_loan, loan_id: 'someone-else'}},
    ]) {
      expect(() => loanDeadlineSnapshot(bad, now)).toThrow(LoanDeadlineDataError);
    }
  });
});
