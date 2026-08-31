import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, reachLendingGrade, rejectionOf } from '../testing/database';

/**
 * The SQL this module's repository depends on.
 *
 * `backend/src/progression.db.test.ts` already proves the rules 076-078
 * introduced -- that an overdue loan can be repaid, that it still blocks a
 * second draw, that a stage is never taken back. None of that is repeated
 * here. What this file covers is the part a repository can get wrong on its
 * own: the OUT parameter names it selects by, the EXECUTE grants it needs, and
 * the values the routes hand to a screen.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

/** The statement ProgressionRepository.status runs, verbatim. */
const STATUS_SQL = `SELECT progression.stage_code, progression.reached_at,
              progression.next_stage_code, progression.next_requirements
       FROM public.progression_my_status($1) AS progression`;

/** The statement ProgressionRepository.loans runs, verbatim. */
const LOANS_SQL = `SELECT loan.loan_id::text AS loan_id,
              loan.principal_amount::text AS principal_amount,
              loan.interest_amount::text AS interest_amount,
              loan.outstanding_amount::text AS outstanding_amount,
              loan.status, loan.issued_at, loan.repaid_at
       FROM public.bank_my_loans($1) AS loan`;

describe.skipIf(!DATABASE_URL)('growth stages and credit against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * The other half of the "tables are unreadable" assertion. Revoking the
   * tables is only safe if the functions were granted, and a forgotten GRANT
   * shows up as 42501 "permission denied for function" -- at runtime, on a
   * member's screen, with nothing in the unit tests to catch it.
   */
  it('lets the application role execute the read models', async () => {
    const stranger = randomUUID();
    const status = await rejectionOf(() => pool.query(STATUS_SQL, [stranger]));
    expect(isMissingGrant(status), 'progression_my_status must be executable').toBe(false);
    expect(status).toBeNull();

    const grade = await rejectionOf(() =>
      pool.query('SELECT public.bank_credit_grade($1) AS grade', [stranger]),
    );
    expect(isMissingGrant(grade), 'bank_credit_grade must be executable').toBe(false);
    expect(grade).toBeNull();

    const loans = await rejectionOf(() => pool.query(LOANS_SQL, [stranger]));
    expect(isMissingGrant(loans), 'bank_my_loans must be executable').toBe(false);
    expect(loans).toBeNull();
  });

  /**
   * The scheduler runs this statement as `moneyverse_app` once a day, and it
   * is the only thing that ever produces an `overdue` loan. Rolled back:
   * marking a live loan overdue would change what every later test reads.
   */
  it('lets the scheduler run the maturity sweep as the application role', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const error = await rejectionOf(() =>
        client.query('SELECT public.bank_mark_overdue_loans()::text AS marked'),
      );
      expect(isMissingGrant(error), 'bank_mark_overdue_loans must be executable').toBe(false);
      expect(error).toBeNull();
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  /**
   * A member who has never been refreshed has no `user_progression` row, and
   * the read model answers with none. The route reports that as null, so the
   * screen can say the stage has not been worked out yet -- which is a
   * different fact from a failed request.
   */
  it('answers with no rows for a member who has never been refreshed', async () => {
    const { rows } = await pool.query(STATUS_SQL, [randomUUID()]);
    expect(rows).toHaveLength(0);
  });

  /** A scalar function always yields one row; the grade inside it is null. */
  it('answers a stranger with one row carrying no grade', async () => {
    const { rows } = await pool.query<{ grade: string | null }>(
      'SELECT public.bank_credit_grade($1) AS grade',
      [randomUUID()],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.grade).toBeNull();
  });

  /**
   * 077 raises 28000 for an actor that is not an active user, which the
   * controller maps to 403. It must not be 42501: that would mean the grant
   * is missing rather than the function refusing.
   */
  it('refuses to recompute a stage for somebody who is not an active user', async () => {
    const error = await rejectionOf(() =>
      pool.query('SELECT * FROM public.progression_refresh($1)', [randomUUID()]),
    );
    expect(isMissingGrant(error), 'progression_refresh must be executable').toBe(false);
    expect(code(error)).toBe('28000');
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('with members to read', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await migrator.end();
    });

    /**
     * Every write runs inside a transaction that is rolled back. A committed
     * loan or a committed stage would move the ledger and the progression
     * table for every later test in the run.
     */
    const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
      const client = await migrator.connect();
      try {
        await client.query('BEGIN');
        await body(client);
      } finally {
        await client.query('ROLLBACK');
        client.release();
      }
    };

    /** A member whose account was opened `ageInDays` ago. */
    const member = async (client: PoolClient, ageInDays = 0): Promise<string> => {
      const id = randomUUID();
      await client.query(
        `INSERT INTO public.users (id, created_at)
         VALUES ($1, clock_timestamp() - pg_catalog.make_interval(days => $2::integer))`,
        [id, ageInDays],
      );
      return id;
    };

    /** A member with the accounts and the cash a loan needs. */
    const borrower = async (client: PoolClient): Promise<string> => {
      const id = await member(client);
      await client.query(
        `INSERT INTO public.accounts (account_type, owner_user_id)
         VALUES ('USER_CASH', $1), ('USER_BANK', $1)`,
        [id],
      );
      await client.query(
        `INSERT INTO public.account_balances (account_id)
         SELECT account_row.id FROM public.accounts AS account_row
         WHERE account_row.owner_user_id = $1`,
        [id],
      );
      const { rows } = await client.query<{ cash: string; mint: string }>(
        `SELECT (SELECT id::text FROM public.accounts
                 WHERE owner_user_id = $1 AND account_type = 'USER_CASH') AS cash,
                (SELECT id::text FROM public.accounts WHERE system_key = 'mint') AS mint`,
        [id],
      );
      await client.query(
        `SELECT public.economy_post_transaction(
           $1, 'ADMIN_ADJUSTMENT', $2, NULL,
           jsonb_build_array(
             jsonb_build_object('accountId', $3::uuid, 'amount', 5000, 'direction', 'credit'),
             jsonb_build_object('accountId', $4::uuid, 'amount', 5000, 'direction', 'debit')
           ), 'test.funded', '{}'::jsonb)`,
        [randomUUID(), id, rows[0]?.mint, rows[0]?.cash],
      );
      // 096 applies `bank_credit_policies.credit_limit`, which the seeded
      // 'new' grade sets to zero -- section 14.4's 신규 대출 불가. A borrower
      // is now somebody who has reached a grade that lends, so this fixture
      // arranges that too rather than every loan test doing it.
      await reachLendingGrade(client, id);
      return id;
    };

    /** Paid work, without walking the whole assign-submit-verify flow. */
    const completions = async (client: PoolClient, actor: string, count: number): Promise<void> => {
      const { rows } = await client.query<{ id: string }>(
        "SELECT id::text FROM public.work_task_catalog WHERE code = 'logistics_sorting'",
      );
      for (let index = 0; index < count; index += 1) {
        const assignment = randomUUID();
        await client.query(
          `INSERT INTO public.work_assignments (id, user_id, task_id, expires_at)
           VALUES ($1, $2, $3, clock_timestamp() + interval '1 day')`,
          [assignment, actor, rows[0]?.id],
        );
        await client.query(
          `INSERT INTO public.work_reward_receipts
             (idempotency_key, user_id, assignment_id, reward_amount, experience_amount)
           VALUES ($1, $2, $3, 10, 10)`,
          [randomUUID(), actor, assignment],
        );
      }
    };

    /**
     * The names, not just the values. A repository that selects a column the
     * function does not declare gets `undefined` at runtime with no type
     * error, which is why the statement under test is the one the repository
     * ships rather than a paraphrase of it.
     */
    it('answers the stage read with exactly the columns the repository selects', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('SELECT * FROM public.progression_refresh($1)', [actor]);

        const { rows } = await client.query(STATUS_SQL, [actor]);
        expect(rows).toHaveLength(1);
        expect(Object.keys(rows[0] ?? {}).sort()).toEqual([
          'next_requirements',
          'next_stage_code',
          'reached_at',
          'stage_code',
        ]);
      });
    });

    it('names the next stage and what it asks for', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('SELECT * FROM public.progression_refresh($1)', [actor]);

        const { rows } = await client.query<{
          stage_code: string;
          next_stage_code: string | null;
          next_requirements: Record<string, number> | null;
        }>(STATUS_SQL, [actor]);
        expect(rows[0]?.stage_code).toBe('starter');
        expect(rows[0]?.next_stage_code).toBe('early');
        // Read as an object by pg, not as a string: the route hands it to the
        // page untouched and the page renders each requirement by name.
        expect(rows[0]?.next_requirements).toStrictEqual({ workCompletions: 10, jobLevel: 3 });
      });
    });

    /**
     * The last stage has no successor. Both next-stage columns are null there,
     * which is why the row interface declares them nullable -- a screen that
     * assumed a next stage would head an empty section with it.
     */
    it('leaves the next stage empty at the top of the ladder', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('SELECT * FROM public.progression_refresh($1)', [actor]);
        await client.query(
          "UPDATE public.user_progression SET stage_code = 'advanced' WHERE user_id = $1",
          [actor],
        );

        const { rows } = await client.query<{
          next_stage_code: string | null;
          next_requirements: unknown;
        }>(STATUS_SQL, [actor]);
        expect(rows[0]?.next_stage_code).toBeNull();
        expect(rows[0]?.next_requirements).toBeNull();
      });
    });

    it('grades a brand new account as new', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const { rows } = await client.query<{ grade: string | null }>(
          'SELECT public.bank_credit_grade($1) AS grade',
          [actor],
        );
        expect(rows[0]?.grade).toBe('new');
      });
    });

    /**
     * Both halves of a policy have to be met, and the best match wins. Eight
     * days and ten completions clear grade C; the 'new' policy still matches,
     * so this also proves the ORDER BY picks the higher limit rather than the
     * first row.
     */
    it('lifts the grade once the account age and the work both qualify', async () => {
      await rolledBack(async (client) => {
        const young = await member(client, 2);
        await completions(client, young, 10);
        const { rows: tooYoung } = await client.query<{ grade: string | null }>(
          'SELECT public.bank_credit_grade($1) AS grade',
          [young],
        );
        expect(tooYoung[0]?.grade, 'two days old is not seven').toBe('new');

        const earned = await member(client, 8);
        await completions(client, earned, 10);
        const { rows } = await client.query<{ grade: string | null }>(
          'SELECT public.bank_credit_grade($1) AS grade',
          [earned],
        );
        expect(rows[0]?.grade).toBe('C');
      });
    });

    /**
     * The distinction the screen exists to draw. `bank_my_loans` predates the
     * `overdue` status by forty-one migrations, so this is the assertion that
     * it reports the third status at all rather than filtering it out.
     */
    it('reports an overdue loan as overdue in the caller’s loan list', async () => {
      await rolledBack(async (client) => {
        const actor = await borrower(client);
        await client.query('SELECT * FROM public.bank_borrow($1, $2, 1000)', [randomUUID(), actor]);
        await client.query(
          `UPDATE public.virtual_bank_loans
           SET maturity_at = clock_timestamp() - interval '1 day' WHERE user_id = $1`,
          [actor],
        );
        await client.query('SELECT public.bank_mark_overdue_loans()');

        const { rows } = await client.query<{
          status: string;
          outstanding_amount: string;
          repaid_at: Date | null;
        }>(LOANS_SQL, [actor]);
        expect(rows).toHaveLength(1);
        expect(rows[0]?.status).toBe('overdue');
        // Cast in the SELECT, so it arrives as a string and stays one. 1000
        // principal plus the C grade's 8%, which 096 made the rate this loan
        // is actually written at -- it was a flat 5% for every grade before.
        expect(rows[0]?.outstanding_amount).toBe('1080');
        expect(rows[0]?.repaid_at).toBeNull();
      });
    });

    it('answers the loan read with exactly the columns the repository selects', async () => {
      await rolledBack(async (client) => {
        const actor = await borrower(client);
        await client.query('SELECT * FROM public.bank_borrow($1, $2, 1000)', [randomUUID(), actor]);

        const { rows } = await client.query(LOANS_SQL, [actor]);
        expect(Object.keys(rows[0] ?? {}).sort()).toEqual([
          'interest_amount',
          'issued_at',
          'loan_id',
          'outstanding_amount',
          'principal_amount',
          'repaid_at',
          'status',
        ]);
      });
    });

    /**
     * One member's loans, and only theirs. `bank_my_loans` filters by the
     * actor itself, which is what lets the route pass the session's user id
     * straight through with no ownership check of its own.
     */
    it('shows a member none of somebody else’s loans', async () => {
      await rolledBack(async (client) => {
        const borrowing = await borrower(client);
        await client.query('SELECT * FROM public.bank_borrow($1, $2, 1000)', [
          randomUUID(),
          borrowing,
        ]);
        const bystander = await member(client);

        const { rows } = await client.query(LOANS_SQL, [bystander]);
        expect(rows).toHaveLength(0);
      });
    });
  });
});
