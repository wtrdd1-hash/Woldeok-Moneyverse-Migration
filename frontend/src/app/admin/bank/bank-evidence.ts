import type { AdminBankOverview, AdminCreditGrade, AdminLoan } from '../types';

export interface VerifiedAdminBankResponse {
  readonly overview: AdminBankOverview;
  readonly grades: readonly AdminCreditGrade[];
  readonly loans: readonly AdminLoan[];
}

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** PostgreSQL bigint/numeric money must stay decimal strings, never JS floats. */
function decimal(value: unknown, maxDigits = 78): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value) && value.length <= maxDigits;
}

function count(value: unknown): value is string {
  return decimal(value, 20);
}

function integer(value: unknown, maximum = 1_000_000): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= maximum;
}

function label(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= 256;
}

function uuid(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function timestamp(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function optionalTimestamp(value: unknown): value is string | null {
  return value === null || timestamp(value);
}

function overview(value: unknown): value is AdminBankOverview {
  if (!record(value)) return false;
  const amounts = [
    'deposit_amount',
    'outstanding_amount',
    'overdue_amount',
    'issued_24h_amount',
    'repaid_24h_amount',
  ];
  const counts = [
    'depositor_count',
    'open_loan_count',
    'overdue_loan_count',
    'maturing_7d_count',
    'issued_24h_count',
    'borrower_count',
  ];
  if (!amounts.every((key) => decimal(value[key])) || !counts.every((key) => count(value[key])))
    return false;
  return (
    BigInt(value.overdue_amount as string) <= BigInt(value.outstanding_amount as string) &&
    BigInt(value.overdue_loan_count as string) <= BigInt(value.open_loan_count as string) &&
    BigInt(value.maturing_7d_count as string) <= BigInt(value.open_loan_count as string) &&
    BigInt(value.borrower_count as string) <= BigInt(value.open_loan_count as string)
  );
}

function grade(value: unknown): value is AdminCreditGrade {
  if (!record(value)) return false;
  return (
    label(value.grade) &&
    integer(value.minimum_account_days) &&
    integer(value.minimum_work_completions) &&
    decimal(value.credit_limit) &&
    integer(value.interest_bps, 100_000) &&
    integer(value.term_days, 100_000) &&
    decimal(value.minimum_repayment) &&
    typeof value.active === 'boolean' &&
    count(value.open_loan_count) &&
    decimal(value.outstanding_amount) &&
    count(value.overdue_loan_count) &&
    count(value.issued_loan_count) &&
    decimal(value.issued_principal) &&
    BigInt(value.overdue_loan_count) <= BigInt(value.open_loan_count)
  );
}

function loan(value: unknown): value is AdminLoan {
  if (!record(value)) return false;
  return (
    uuid(value.loan_id) &&
    uuid(value.user_id) &&
    label(value.display_name) &&
    label(value.credit_grade) &&
    (value.status === 'active' || value.status === 'overdue') &&
    decimal(value.principal_amount) &&
    decimal(value.interest_amount) &&
    decimal(value.outstanding_amount) &&
    decimal(value.repaid_amount) &&
    decimal(value.minimum_repayment) &&
    timestamp(value.issued_at) &&
    optionalTimestamp(value.maturity_at) &&
    optionalTimestamp(value.overdue_at) &&
    (value.status_reason === null ||
      (typeof value.status_reason === 'string' && value.status_reason.length <= 1024))
  );
}

export function validateAdminBankResponse(value: unknown): VerifiedAdminBankResponse | null {
  if (
    !record(value) ||
    !overview(value.overview) ||
    !Array.isArray(value.grades) ||
    value.grades.length > 100 ||
    !value.grades.every(grade) ||
    !Array.isArray(value.loans) ||
    value.loans.length > 50 ||
    !value.loans.every(loan)
  )
    return null;
  const grades = value.grades as AdminCreditGrade[];
  const loans = value.loans as AdminLoan[];
  if (
    new Set(grades.map((g) => g.grade)).size !== grades.length ||
    new Set(loans.map((l) => l.loan_id)).size !== loans.length ||
    BigInt(loans.length) > BigInt(value.overview.open_loan_count)
  )
    return null;
  return value as unknown as VerifiedAdminBankResponse;
}
