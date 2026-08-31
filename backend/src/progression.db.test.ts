import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, reachLendingGrade, rejectionOf } from './testing/database';

/**
 * Migrations 076-078, executed.
 *
 * The case that matters most is the one that made defaulting pay: 076 adds an
 * `overdue` loan status, and every loan function written before it tested
 * `status = 'active'`. An overdue loan would have been unrepayable by its
 * borrower and would no longer have blocked a second draw.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('progression and credit against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the progression tables unreadable by the application role', async () => {
    for (const table of ['progression_stages', 'user_progression', 'bank_credit_policies']) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('loans that pass their maturity', () => {
    let migrator: Pool;

    beforeAll(() => {
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await migrator.end();
    });

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

    /**
     * A member with accounts and enough cash to settle a loan. The interest
     * is added to the principal, so repaying in full costs more than was
     * borrowed and a member funded only by the loan itself cannot do it --
     * `USER_CASH` does not allow a negative balance.
     */
    const borrower = async (client: PoolClient): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
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
      return id;
    };

    /** Completed work, without walking the whole assign-submit-verify flow. */
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

    it('records the grade, the term and the minimum repayment on a new loan', async () => {
      await rolledBack(async (client) => {
        const actor = await borrower(client);
        // 096 refuses the seeded 'new' grade outright, so a test about loans
        // has to reach a grade that lends before it can have one.
        await reachLendingGrade(client, actor);
        await client.query('SELECT * FROM public.bank_borrow($1, $2, 1000)', [
          randomUUID(),
          actor,
        ]);

        const { rows } = await client.query<{
          credit_grade: string;
          minimum_repayment: string;
          matures: boolean;
        }>(
          `SELECT loan_row.credit_grade, loan_row.minimum_repayment::text,
                  (loan_row.maturity_at IS NOT NULL) AS matures
           FROM public.virtual_bank_loans AS loan_row WHERE loan_row.user_id = $1`,
          [actor],
        );
        // 096 applies the seeded credit limit, so 'new' no longer borrows at
        // all and the grade written on a loan is the first one that lends.
        // The comment here used to say the opposite, and said why: applying
        // the limit would take a capability away from members who had not
        // worked yet. Section 14.4 is the decision that it should.
        expect(rows[0]?.credit_grade).toBe('C');
        expect(rows[0]?.minimum_repayment, "the C grade's own minimum").toBe('100');
        expect(rows[0]?.matures, 'the maturity sweep needs a maturity').toBe(true);
      });
    });

    it('lets the borrower repay a loan that has gone overdue', async () => {
      await rolledBack(async (client) => {
        const actor = await borrower(client);
        // 096 refuses the seeded 'new' grade outright, so a test about loans
        // has to reach a grade that lends before it can have one.
        await reachLendingGrade(client, actor);
        const { rows: loan } = await client.query<{ loan_id: string }>(
          'SELECT borrowed.loan_id::text FROM public.bank_borrow($1, $2, 1000) AS borrowed',
          [randomUUID(), actor],
        );
        const loanId = loan[0]?.loan_id;

        await client.query(
          "UPDATE public.virtual_bank_loans SET maturity_at = clock_timestamp() - interval '1 day' WHERE id = $1",
          [loanId],
        );
        const { rows: swept } = await client.query<{ marked: number }>(
          'SELECT public.bank_mark_overdue_loans() AS marked',
        );
        expect(swept[0]?.marked).toBeGreaterThanOrEqual(1);

        const { rows: after } = await client.query<{ status: string }>(
          'SELECT status FROM public.virtual_bank_loans WHERE id = $1',
          [loanId],
        );
        expect(after[0]?.status).toBe('overdue');

        // The whole point. Before this migration the borrower could not pay.
        const { rows: repaid } = await client.query<{ outstanding_amount: string }>(
          `SELECT repayment.outstanding_amount::text
           FROM public.bank_repay($1, $2, $3, 2000) AS repayment`,
          [randomUUID(), actor, loanId],
        );
        expect(repaid[0]?.outstanding_amount).toBe('0');

        const { rows: closed } = await client.query<{ status: string }>(
          'SELECT status FROM public.virtual_bank_loans WHERE id = $1',
          [loanId],
        );
        expect(closed[0]?.status).toBe('repaid');
      });
    });

    it('keeps an overdue loan from being replaced by a fresh one', async () => {
      await rolledBack(async (client) => {
        const actor = await borrower(client);
        // 096 refuses the seeded 'new' grade outright, so a test about loans
        // has to reach a grade that lends before it can have one.
        await reachLendingGrade(client, actor);
        await client.query('SELECT * FROM public.bank_borrow($1, $2, 1000)', [
          randomUUID(),
          actor,
        ]);
        await client.query(
          "UPDATE public.virtual_bank_loans SET maturity_at = clock_timestamp() - interval '1 day' WHERE user_id = $1",
          [actor],
        );
        await client.query('SELECT public.bank_mark_overdue_loans()');

        // Defaulting must not free the borrow slot, or not paying becomes
        // strictly better than paying.
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.bank_borrow($1, $2, 1000)', [randomUUID(), actor]),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('leaves a partly repaid overdue loan overdue', async () => {
      await rolledBack(async (client) => {
        const actor = await borrower(client);
        // 096 refuses the seeded 'new' grade outright, so a test about loans
        // has to reach a grade that lends before it can have one.
        await reachLendingGrade(client, actor);
        const { rows: loan } = await client.query<{ loan_id: string }>(
          'SELECT borrowed.loan_id::text FROM public.bank_borrow($1, $2, 1000) AS borrowed',
          [randomUUID(), actor],
        );
        await client.query(
          "UPDATE public.virtual_bank_loans SET maturity_at = clock_timestamp() - interval '1 day' WHERE id = $1",
          [loan[0]?.loan_id],
        );
        await client.query('SELECT public.bank_mark_overdue_loans()');
        await client.query('SELECT * FROM public.bank_repay($1, $2, $3, 100)', [
          randomUUID(),
          actor,
          loan[0]?.loan_id,
        ]);

        const { rows } = await client.query<{ status: string }>(
          'SELECT status FROM public.virtual_bank_loans WHERE id = $1',
          [loan[0]?.loan_id],
        );
        expect(rows[0]?.status).toBe('overdue');
      });
    });

    it('reads every requirement a stage declares, not only the first', async () => {
      await rolledBack(async (client) => {
        const actor = await borrower(client);
        await completions(client, actor, 12);

        // Twelve completions clears `early`'s workCompletions of 10, but that
        // stage also asks for jobLevel 3 and this member has none.
        const { rows } = await client.query<{ stage_code: string }>(
          'SELECT refreshed.stage_code FROM public.progression_refresh($1) AS refreshed',
          [actor],
        );
        expect(rows[0]?.stage_code).toBe('starter');

        await client.query(
          `INSERT INTO public.user_job_progress (user_id, job_type, experience, level)
           VALUES ($1, 'carrier', 300, 4)`,
          [actor],
        );
        const { rows: advanced } = await client.query<{ stage_code: string }>(
          'SELECT refreshed.stage_code FROM public.progression_refresh($1) AS refreshed',
          [actor],
        );
        expect(advanced[0]?.stage_code).toBe('early');
      });
    });

    it('never takes a stage back', async () => {
      await rolledBack(async (client) => {
        const actor = await borrower(client);
        await completions(client, actor, 12);
        await client.query(
          `INSERT INTO public.user_job_progress (user_id, job_type, experience, level)
           VALUES ($1, 'carrier', 300, 4)`,
          [actor],
        );
        await client.query('SELECT * FROM public.progression_refresh($1)', [actor]);

        const { rows: reached } = await client.query<{ reached_at: Date }>(
          'SELECT reached_at FROM public.user_progression WHERE user_id = $1',
          [actor],
        );

        // The member loses the job level that got them here.
        await client.query('DELETE FROM public.user_job_progress WHERE user_id = $1', [actor]);
        const { rows } = await client.query<{ stage_code: string }>(
          'SELECT refreshed.stage_code FROM public.progression_refresh($1) AS refreshed',
          [actor],
        );
        expect(rows[0]?.stage_code).toBe('early');

        const { rows: unchanged } = await client.query<{ reached_at: Date }>(
          'SELECT reached_at FROM public.user_progression WHERE user_id = $1',
          [actor],
        );
        expect(unchanged[0]?.reached_at).toStrictEqual(reached[0]?.reached_at);
      });
    });
  });
});
