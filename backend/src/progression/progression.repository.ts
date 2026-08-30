import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ProgressionInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProgressionInputError';
  }
}

/**
 * Validated here as well as in the database function. The double gate is
 * deliberate and documented across this codebase: the function is the
 * authority, and this turns a malformed argument into a 400 with a sentence
 * about the field rather than a 500 carrying a message about a function.
 */
function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new ProgressionInputError(`${field} must be a UUID`);
  }
}

/**
 * The jsonb payload of `progression_stages.unlock_requirements`. 076 seeds
 * `workCompletions`, `jobLevel` and `businesses`, and 077 reads each value
 * back with `::integer`. These are counts of finished tasks, job levels and
 * businesses -- never money -- so a number is the right type here. Nothing in
 * this payload is a balance, and nothing in this module turns one into a
 * number.
 */
export type ProgressionRequirements = Readonly<Record<string, number>>;

/**
 * public.progression_my_status RETURNS TABLE:
 * packages/database/migrations/078-loan-maturity-and-read-models.sql
 *
 * `next_stage_code` and `next_requirements` are null at the last stage: the
 * function LEFT JOINs the stage one ordinal higher and there is none.
 */
export interface ProgressionStatusRow {
  readonly stage_code: string;
  readonly reached_at: Date;
  readonly next_stage_code: string | null;
  readonly next_requirements: ProgressionRequirements | null;
}

/**
 * public.progression_refresh RETURNS TABLE:
 * packages/database/migrations/077-progression-and-loan-functions.sql
 *
 * The function names its third column `requirements`; the query below aliases
 * it to `next_requirements`. It is the same fact the read model returns under
 * that name -- the requirements of the *next* stage -- and a caller should not
 * have to know which of the two functions produced the answer it is holding.
 */
export interface ProgressionRefreshRow {
  readonly stage_code: string;
  readonly next_stage_code: string | null;
  readonly next_requirements: ProgressionRequirements | null;
}

/**
 * public.bank_credit_grade returns text:
 * packages/database/migrations/077-progression-and-loan-functions.sql
 *
 * Null rather than a grade when the caller is not an active user; the seeded
 * 'new' policy asks for nothing, so an active member always matches something.
 */
export interface CreditGradeRow {
  readonly grade: string | null;
}

/**
 * public.bank_my_loans RETURNS TABLE:
 * packages/database/migrations/035-virtual-bank-loans.sql
 *
 * `status` is 'active', 'repaid', or -- since 076 -- 'overdue'. It stays the
 * database's own text instead of being narrowed to a union here: a status
 * added by a later migration has to reach the page as itself rather than as a
 * 500, which is exactly how 'overdue' broke the wallet's loan list.
 *
 * Every amount is a bigint and is cast in the SELECT, because the SELECT is
 * where the rounding would happen.
 */
export interface CreditLoanRow {
  readonly loan_id: string;
  readonly principal_amount: string;
  readonly interest_amount: string;
  readonly outstanding_amount: string;
  readonly status: string;
  readonly issued_at: Date;
  readonly repaid_at: Date | null;
}

export class ProgressionRepository {
  constructor(private readonly pool: Queryable) {}

  /**
   * The stored stage, which is null until something has refreshed it. A member
   * who has never been through `progression_refresh` has no `user_progression`
   * row, and the read model answers with no rows rather than inventing a
   * starter stage. That null is a real state and the caller has to render it,
   * so it is not quietly turned into a stage here.
   */
  async status(actor: unknown): Promise<ProgressionStatusRow | null> {
    assertUuid(actor, 'actor');
    return queryOne<ProgressionStatusRow>(
      this.pool,
      `SELECT progression.stage_code, progression.reached_at,
              progression.next_stage_code, progression.next_requirements
       FROM public.progression_my_status($1) AS progression`,
      [actor],
    );
  }

  /**
   * Recomputes the stage from work completions, job level and businesses. A
   * write, and the only thing that ever creates a `user_progression` row --
   * but it carries no idempotency key because it is naturally idempotent:
   * running it twice with nothing else changed leaves the same stage and the
   * same `reached_at`, and 077 never takes a stage back.
   */
  async refresh(actor: unknown): Promise<ProgressionRefreshRow | null> {
    assertUuid(actor, 'actor');
    return queryOne<ProgressionRefreshRow>(
      this.pool,
      `SELECT refreshed.stage_code, refreshed.next_stage_code,
              refreshed.requirements AS next_requirements
       FROM public.progression_refresh($1) AS refreshed`,
      [actor],
    );
  }

  /**
   * A scalar-returning function, so this always yields exactly one row and the
   * grade inside it may be null. The null is handled by the caller rather than
   * asserted away.
   */
  async creditGrade(actor: unknown): Promise<CreditGradeRow> {
    assertUuid(actor, 'actor');
    const row = await queryOne<CreditGradeRow>(
      this.pool,
      'SELECT public.bank_credit_grade($1) AS grade',
      [actor],
    );
    if (!row) throw new Error('bank_credit_grade did not return a row');
    return row;
  }

  async loans(actor: unknown): Promise<CreditLoanRow[]> {
    assertUuid(actor, 'actor');
    return queryRows<CreditLoanRow>(
      this.pool,
      `SELECT loan.loan_id::text AS loan_id,
              loan.principal_amount::text AS principal_amount,
              loan.interest_amount::text AS interest_amount,
              loan.outstanding_amount::text AS outstanding_amount,
              loan.status, loan.issued_at, loan.repaid_at
       FROM public.bank_my_loans($1) AS loan`,
      [actor],
    );
  }
}
