type PreviewErrorCode = 'INVALID_AMOUNT' | 'NO_ACTIVE_LOAN' | 'STANDING_UNAVAILABLE';

export class RepaymentPreviewError extends Error {
  constructor(readonly code: PreviewErrorCode) {
    super(code);
    this.name = 'RepaymentPreviewError';
  }
}

export interface RepaymentPreview {
  readonly loanId: string;
  readonly requestedAmount: string;
  readonly effectiveAmount: string;
  readonly cashBalance: string;
  readonly outstandingAmount: string;
  readonly remainingCash: string | null;
  readonly remainingDebt: string | null;
  readonly canRepay: boolean;
  readonly reason: 'READY' | 'CAPPED_TO_OUTSTANDING' | 'INSUFFICIENT_CASH';
  readonly previewOnly: true;
  readonly revalidateAtExecution: true;
}

const POSITIVE_AMOUNT = /^[1-9][0-9]{0,99}$/;
const NONNEGATIVE_AMOUNT = /^(?:0|[1-9][0-9]{0,99})$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

/** This read-only estimate mirrors bank_repay's LEAST(requested, outstanding) rule.
 * The database command remains the sole authority for the eventual posting. */
export function previewLoanRepayment(standingValue: unknown, amountValue: unknown): RepaymentPreview {
  if (typeof amountValue !== 'string' || !POSITIVE_AMOUNT.test(amountValue)) {
    throw new RepaymentPreviewError('INVALID_AMOUNT');
  }
  const standing = record(standingValue);
  if (!standing || typeof standing.cash_balance !== 'string' ||
      !NONNEGATIVE_AMOUNT.test(standing.cash_balance)) {
    throw new RepaymentPreviewError('STANDING_UNAVAILABLE');
  }
  const loan = record(standing.active_loan);
  if (!loan || (loan.status !== 'active' && loan.status !== 'overdue')) {
    throw new RepaymentPreviewError('NO_ACTIVE_LOAN');
  }
  if (typeof loan.loan_id !== 'string' || !UUID.test(loan.loan_id) ||
      typeof loan.outstanding_amount !== 'string' ||
      !POSITIVE_AMOUNT.test(loan.outstanding_amount)) {
    throw new RepaymentPreviewError('STANDING_UNAVAILABLE');
  }

  const requested = BigInt(amountValue);
  const outstanding = BigInt(loan.outstanding_amount);
  const cash = BigInt(standing.cash_balance);
  const effective = requested < outstanding ? requested : outstanding;
  const canRepay = cash >= effective;
  return {
    loanId: loan.loan_id,
    requestedAmount: requested.toString(),
    effectiveAmount: effective.toString(),
    cashBalance: cash.toString(),
    outstandingAmount: outstanding.toString(),
    remainingCash: canRepay ? (cash - effective).toString() : null,
    remainingDebt: canRepay ? (outstanding - effective).toString() : null,
    canRepay,
    reason: !canRepay ? 'INSUFFICIENT_CASH' : requested > outstanding ? 'CAPPED_TO_OUTSTANDING' : 'READY',
    previewOnly: true,
    revalidateAtExecution: true,
  };
}
