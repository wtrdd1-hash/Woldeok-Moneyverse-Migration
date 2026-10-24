/** A read-only projection of the bank's authoritative, actor-scoped standing. */
export interface VerifiedCreditPolicy {
  readonly creditGrade: string;
  readonly creditLimitWld: string;
  readonly interestRateBps: number;
  readonly termDays: number;
  readonly minimumRepaymentWld: string;
  readonly activeLoanOutstandingWld: string | null;
  readonly activeLoanStatus: 'active' | 'overdue' | null;
  readonly hasActiveLoan: boolean;
  /** This is a precondition only; the bank rechecks eligibility on execution. */
  readonly canRequestNewLoan: boolean;
  readonly source: 'BANK_STANDING';
}

export class BankPolicyUnavailableError extends Error {
  constructor() {
    super('verified bank credit policy is unavailable');
    this.name = 'BankPolicyUnavailableError';
  }
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BankPolicyUnavailableError();
  }
  return value as Record<string, unknown>;
}

function integerString(value: unknown): string {
  // PostgreSQL NUMERIC values must cross the API as decimal integer strings.
  if (typeof value !== 'string' || !/^(?:0|[1-9][0-9]{0,119})$/.test(value)) {
    throw new BankPolicyUnavailableError();
  }
  return value;
}

function integer(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max) {
    throw new BankPolicyUnavailableError();
  }
  return value;
}

export function projectCreditPolicy(standing: unknown): VerifiedCreditPolicy {
  const data = object(standing);
  const grade = data['credit_grade'];
  if (typeof grade !== 'string' || !/^[a-zA-Z0-9_-]{1,32}$/.test(grade)) {
    throw new BankPolicyUnavailableError();
  }
  const creditLimitWld = integerString(data['credit_limit']);
  const minimumRepaymentWld = integerString(data['loan_minimum_repayment']);
  const interestRateBps = integer(data['loan_interest_bps'], 0, 100_000);
  const termDays = integer(data['loan_term_days'], 1, 3650);
  const rawLoan = data['active_loan'];
  if (rawLoan === undefined) throw new BankPolicyUnavailableError();
  let activeLoanStatus: 'active' | 'overdue' | null = null;
  let activeLoanOutstandingWld: string | null = null;
  if (rawLoan !== null) {
    const loan = object(rawLoan);
    const status = loan['status'];
    if (status !== 'active' && status !== 'overdue') throw new BankPolicyUnavailableError();
    activeLoanStatus = status;
    activeLoanOutstandingWld = integerString(loan['outstanding_amount']);
  }
  return {
    creditGrade: grade,
    creditLimitWld,
    interestRateBps,
    termDays,
    minimumRepaymentWld,
    activeLoanOutstandingWld,
    activeLoanStatus,
    hasActiveLoan: activeLoanStatus !== null,
    canRequestNewLoan: activeLoanStatus === null && BigInt(creditLimitWld) > 0n,
    source: 'BANK_STANDING',
  };
}
