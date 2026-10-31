import type { CreditLoan, CreditRung } from './credit';

export interface VerifiedCreditEvidence {
  readonly grade: string | null;
  readonly loans: readonly CreditLoan[];
  readonly ladder: readonly CreditRung[];
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const exactAmount = /^(0|[1-9]\d*)$/;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function integer(value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

function timestamp(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(value)
    && Number.isFinite(Date.parse(value));
}

function amount(value: unknown): value is string {
  return typeof value === 'string' && exactAmount.test(value) && value.length <= 40;
}

function nonemptyText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 64 && !/[\x00-\x1f\x7f]/.test(value);
}

function parseLoan(value: unknown): CreditLoan | null {
  const row = record(value);
  if (!row || typeof row.loan_id !== 'string' || !uuidPattern.test(row.loan_id)
    || !amount(row.principal_amount) || !amount(row.interest_amount)
    || !amount(row.outstanding_amount) || !nonemptyText(row.status)
    || !timestamp(row.issued_at)
    || (row.repaid_at !== null && !timestamp(row.repaid_at))) return null;
  return {
    loan_id: row.loan_id, principal_amount: row.principal_amount,
    interest_amount: row.interest_amount, outstanding_amount: row.outstanding_amount,
    status: row.status, issued_at: row.issued_at, repaid_at: row.repaid_at,
  };
}

function parseRung(value: unknown): CreditRung | null {
  const row = record(value);
  if (!row || !nonemptyText(row.grade)
    || !integer(row.minimum_account_days) || !integer(row.minimum_work_completions)
    || !amount(row.credit_limit) || !integer(row.interest_bps, 0, 10000)
    || !integer(row.term_days, 1, 36500) || !amount(row.minimum_repayment)
    || typeof row.held !== 'boolean') return null;
  return {
    grade: row.grade, minimum_account_days: row.minimum_account_days,
    minimum_work_completions: row.minimum_work_completions,
    credit_limit: row.credit_limit, interest_bps: row.interest_bps,
    term_days: row.term_days, minimum_repayment: row.minimum_repayment, held: row.held,
  };
}

/** A 200 response is not proof that its credit payload is complete. Never turn malformed evidence into an empty loan list. */
export function parseCreditEvidence(value: unknown): VerifiedCreditEvidence | null {
  const data = record(value);
  if (!data || (data.grade !== null && !nonemptyText(data.grade))
    || !Array.isArray(data.loans) || !Array.isArray(data.ladder)
    || data.loans.length > 1000 || data.ladder.length > 32) return null;
  const loans = data.loans.map(parseLoan);
  const ladder = data.ladder.map(parseRung);
  if (loans.some((entry) => entry === null) || ladder.some((entry) => entry === null)) return null;
  const verifiedLoans = loans as CreditLoan[];
  const verifiedLadder = ladder as CreditRung[];
  if (new Set(verifiedLoans.map((loan) => loan.loan_id)).size !== verifiedLoans.length
    || new Set(verifiedLadder.map((rung) => rung.grade)).size !== verifiedLadder.length) return null;
  const held = verifiedLadder.filter((rung) => rung.held);
  if (data.grade === null ? held.length !== 0 : held.length !== 1 || held[0]?.grade !== data.grade) return null;
  return { grade: data.grade, loans: verifiedLoans, ladder: verifiedLadder };
}

/** The CTA is navigation, not credit approval: the bank still enforces all eligibility and consent. */
export function canOfferCreditApplication(evidence: VerifiedCreditEvidence | null): boolean {
  if (!evidence || evidence.grade === null) return false;
  const policy = evidence.ladder.find((rung) => rung.held && rung.grade === evidence.grade);
  return Boolean(policy && policy.credit_limit !== '0'
    && evidence.loans.every((loan) => loan.status === 'repaid'));
}
