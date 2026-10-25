/**
 * Owner-scoped, read-only loan deadline status from bank_get_my_standing.
 * This does not promise a future rate, schedule a reminder or initiate repayment.
 * The authoritative loan and cash states are rechecked by bank_repay at execution.
 */
export class LoanDeadlineDataError extends Error {
  constructor() { super('verified loan deadline standing is unavailable'); }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DECIMAL = /^(0|[1-9][0-9]*)$/;
const TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const DAY_MS = 86_400_000;

function wld(value: unknown): bigint {
  if (typeof value !== 'string' || value.length > 128 || !DECIMAL.test(value)) {
    throw new LoanDeadlineDataError();
  }
  return BigInt(value);
}

export type LoanDeadlineSnapshot =
  | { readonly hasActiveLoan: false; readonly observedAt: string; readonly quoteOnly: true }
  | {
      readonly hasActiveLoan: true;
      readonly quoteOnly: true;
      readonly observedAt: string;
      readonly loanId: string;
      readonly loanStatus: 'active' | 'overdue';
      readonly maturityAt: string;
      readonly dueState: 'scheduled' | 'due_soon' | 'overdue';
      readonly daysUntilDue: number | null;
      readonly overdueDays: number | null;
      readonly outstandingAmount: string;
      readonly minimumRepayment: string;
      readonly cashBalance: string;
      readonly canCoverMinimum: boolean | null;
    };

export function loanDeadlineSnapshot(standing: unknown, now = new Date()): LoanDeadlineSnapshot {
  if (!Number.isFinite(now.getTime())) throw new LoanDeadlineDataError();
  if (!standing || typeof standing !== 'object' || Array.isArray(standing)) {
    throw new LoanDeadlineDataError();
  }
  const data = standing as Record<string, unknown>;
  if (!Object.prototype.hasOwnProperty.call(data, 'active_loan')) throw new LoanDeadlineDataError();
  const cash = wld(data['cash_balance']);
  const observedAt = now.toISOString();
  if (data['active_loan'] === null) return { hasActiveLoan: false, quoteOnly: true, observedAt };
  if (!data['active_loan'] || typeof data['active_loan'] !== 'object' || Array.isArray(data['active_loan'])) {
    throw new LoanDeadlineDataError();
  }
  const loan = data['active_loan'] as Record<string, unknown>;
  const loanId = loan['loan_id'];
  const status = loan['status'];
  const maturityAt = loan['maturity_at'];
  if (typeof loanId !== 'string' || !UUID.test(loanId) ||
      (status !== 'active' && status !== 'overdue') ||
      typeof maturityAt !== 'string' || !TIMESTAMP.test(maturityAt)) {
    throw new LoanDeadlineDataError();
  }
  const maturity = Date.parse(maturityAt);
  if (!Number.isFinite(maturity)) throw new LoanDeadlineDataError();
  const outstanding = wld(loan['outstanding_amount']);
  const policyMinimum = wld(loan['minimum_repayment']);
  if (outstanding <= 0n) throw new LoanDeadlineDataError();
  const minimum = policyMinimum > outstanding ? outstanding : policyMinimum;
  const difference = maturity - now.getTime();
  const overdue = status === 'overdue' || difference < 0;
  const dueState = overdue ? 'overdue' : difference <= 7 * DAY_MS ? 'due_soon' : 'scheduled';

  return {
    hasActiveLoan: true,
    quoteOnly: true,
    observedAt,
    loanId,
    loanStatus: status,
    maturityAt,
    dueState,
    daysUntilDue: overdue ? null : Math.ceil(difference / DAY_MS),
    overdueDays: overdue ? Math.max(0, Math.floor(-difference / DAY_MS)) : null,
    outstandingAmount: outstanding.toString(),
    minimumRepayment: minimum.toString(),
    cashBalance: cash.toString(),
    canCoverMinimum: minimum === 0n ? null : cash >= minimum,
  };
}
