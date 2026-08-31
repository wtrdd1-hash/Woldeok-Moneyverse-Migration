/**
 * The credit half of the screen: the loan row as it arrives, and the one
 * question the page keeps asking it -- what standing is this loan in.
 *
 * A loan's status is the database's own text and it is deliberately not
 * narrowed to a union here. 076 added 'overdue' to a column that had held
 * 'active' and 'repaid' for forty migrations, and the wallet's mapper -- which
 * did narrow it -- answered the whole loan list with a 500 the moment the
 * first loan aged. A status this build has not been taught reaches the member
 * as an unfamiliar loan they can still see, not as a page that will not load.
 */

/**
 * `public.bank_my_loans` RETURNS TABLE, as it arrives over the wire:
 * packages/database/migrations/035-virtual-bank-loans.sql.
 *
 * Every amount is a `bigint`, cast to text in the repository's SELECT, and it
 * stays a string the whole way here. `maturity_at` and `minimum_repayment`
 * are absent because that function does not return them -- 076 records both
 * on every loan, but no read model exposes them yet.
 */
export interface CreditLoan {
  readonly loan_id: string;
  readonly principal_amount: string;
  readonly interest_amount: string;
  readonly outstanding_amount: string;
  readonly status: string;
  readonly issued_at: string;
  readonly repaid_at: string | null;
}

export type LoanStanding = 'overdue' | 'active' | 'repaid' | 'unknown';

export const LOAN_STANDING_LABELS: Readonly<Record<LoanStanding, string>> = {
  overdue: '연체',
  active: '상환 중',
  repaid: '상환 완료',
  unknown: '상태 확인 필요',
};

/** The status the database sent, if this build knows what it means. */
export function loanStanding(status: string): LoanStanding {
  return status === 'overdue' || status === 'active' || status === 'repaid' ? status : 'unknown';
}

/**
 * Whether the member can pay this one down.
 *
 * 077's `bank_repay` accepts a loan whose status is 'active' or 'overdue' and
 * refuses anything else with 22023 -- accepting an overdue loan on purpose,
 * because a loan that could not be repaid once it aged would make defaulting
 * the better move. A status this build does not recognise gets no form: the
 * function would refuse it, and a button that cannot work is worse than none.
 */
export function isRepayable(status: string): boolean {
  const standing = loanStanding(status);
  return standing === 'active' || standing === 'overdue';
}

export function hasOverdueLoan(loans: readonly CreditLoan[]): boolean {
  return loans.some((loan) => loanStanding(loan.status) === 'overdue');
}

const STANDING_ORDER: Readonly<Record<LoanStanding, number>> = {
  overdue: 0,
  active: 1,
  unknown: 2,
  repaid: 3,
};

/**
 * Loans with the one that needs attention first.
 *
 * `bank_my_loans` orders by `issued_at DESC`, which puts a loan taken this
 * morning above one that fell overdue last week. Sorting is by standing
 * alone, and `Array.prototype.sort` is stable, so loans sharing a standing
 * keep the newest-first order the database gave them. Nothing here compares
 * an amount: sorting by money would be a comparison this codebase does not
 * make with numbers, and it is not the ordering the member needs anyway.
 */
export function urgentFirst(loans: readonly CreditLoan[]): readonly CreditLoan[] {
  return [...loans].sort(
    (left, right) =>
      STANDING_ORDER[loanStanding(left.status)] - STANDING_ORDER[loanStanding(right.status)],
  );
}

const GRADE_LABELS: Readonly<Record<string, string>> = {
  new: '신규',
  C: 'C 등급',
  B: 'B 등급',
  A: 'A 등급',
};

/**
 * The grade in Korean, or the grade itself when it is one this build has not
 * been taught. `bank_credit_grade` returns the `bank_credit_policies.grade`
 * text and that table's CHECK allows four values today; a fifth added later
 * should appear on screen rather than vanish.
 */
export function gradeLabel(grade: string): string {
  return GRADE_LABELS[grade] ?? grade;
}

/**
 * `public.bank_credit_ladder` RETURNS TABLE (096), as it arrives over the
 * wire. `credit_limit` and `minimum_repayment` are bigints and stay strings.
 *
 * Every one of these numbers is now load-bearing. Before 096 `bank_borrow`
 * lent up to its own hard ceiling at a flat 5% and read none of them, so the
 * screen said so rather than quoting a table the database ignored.
 */
export interface CreditRung {
  readonly grade: string;
  readonly minimum_account_days: number;
  readonly minimum_work_completions: number;
  readonly credit_limit: string;
  readonly interest_bps: number;
  readonly term_days: number;
  readonly minimum_repayment: string;
  readonly held: boolean;
}

/**
 * Basis points as a percentage a member reads.
 *
 * 800 -> '8%', 850 -> '8.5%'. `interest_bps` is an integer bounded at 10,000
 * by 076's CHECK, so this arithmetic is exact.
 */
export function ratePercent(bps: number): string {
  const percent = bps / 100;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(2).replace(/0$/, '')}%`;
}

/**
 * What a rung asks for, as one Korean sentence.
 *
 * The two conditions `bank_credit_grade` actually tests are the account's age
 * and the number of paid tasks -- not the 출석 and 누적 정상 수입 the
 * specification's table describes, which nothing computes. Saying only what
 * is tested is the honest version: a member who meets what is printed here
 * will get the grade.
 */
export function rungConditions(rung: CreditRung): string {
  const parts: string[] = [];
  if (rung.minimum_account_days > 0) parts.push(`가입 ${rung.minimum_account_days}일`);
  if (rung.minimum_work_completions > 0) parts.push(`작업 ${rung.minimum_work_completions}회`);
  return parts.length === 0 ? '조건 없음' : parts.join(' · ');
}

/** True for a rung that lends nothing at all, which is what 'new' is. */
export function lendsNothing(rung: CreditRung): boolean {
  return rung.credit_limit === '0';
}
