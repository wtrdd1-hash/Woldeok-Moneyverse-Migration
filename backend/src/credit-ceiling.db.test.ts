import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from './testing/database';

/**
 * Migration 096, executed.
 *
 * 077 recorded the deferral in its own header -- `credit_limit` and
 * `interest_bps` were seeded and applied by nothing, so `bank_borrow` lent up
 * to its own hard ceiling at a flat 5% and the grade a member held decided
 * only what got written on the loan row. 096 applies both. These are the
 * cases that decide who may borrow, how much, and at what price, so they are
 * asserted against the real functions rather than against a double.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the credit ceiling against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the credit table unreadable by the application role', async () => {
    const error = await rejectionOf(() => pool.query('SELECT * FROM public.bank_credit_policies'));
    expect(String((error as { message?: string }).message)).toMatch(/permission denied/i);
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('what a grade buys', () => {
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

    const member = async (client: PoolClient): Promise<string> => {
      const id = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [id]);
      await client.query(
        `INSERT INTO public.accounts (account_type, owner_user_id) VALUES ('USER_CASH', $1)`,
        [id],
      );
      await client.query(
        `INSERT INTO public.account_balances (account_id)
         SELECT account_row.id FROM public.accounts AS account_row
         WHERE account_row.owner_user_id = $1`,
        [id],
      );
      return id;
    };

    /** Ages the account and gives it paid tasks, which is all a grade tests. */
    const earnGradeC = async (client: PoolClient, actor: string): Promise<void> => {
      await client.query(
        `UPDATE public.users SET created_at = clock_timestamp() - interval '10 days' WHERE id = $1`,
        [actor],
      );
      const task = await client.query<{ id: string }>(
        'SELECT id FROM public.work_task_catalog WHERE active LIMIT 1',
      );
      const taskId = task.rows[0]?.id;
      if (!taskId) throw new Error('the seeded task catalogue is empty');
      for (let paid = 0; paid < 10; paid += 1) {
        const assignment = await client.query<{ id: string }>(
          `INSERT INTO public.work_assignments (user_id, task_id, expires_at)
           VALUES ($1, $2, clock_timestamp() + interval '1 day') RETURNING id`,
          [actor, taskId],
        );
        await client.query(
          `INSERT INTO public.work_reward_receipts
             (idempotency_key, user_id, assignment_id, reward_amount, experience_amount)
           VALUES ($1, $2, $3, 10, 1)`,
          [randomUUID(), actor, assignment.rows[0]?.id],
        );
      }
    };

    /**
     * The clause the whole of 14.4 rests on. Before 096 this borrowed
     * successfully, which made every line of the credit table decorative.
     */
    it('refuses a member who has not reached a grade that lends', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        expect(
          (
            await client.query<{ grade: string }>('SELECT public.bank_credit_grade($1) AS grade', [
              actor,
            ])
          ).rows[0]?.grade,
        ).toBe('new');

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.bank_borrow($1, $2, 1000)', [randomUUID(), actor]),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('refuses an amount above the grade’s ceiling and allows the ceiling itself', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await earnGradeC(client, actor);

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.bank_borrow($1, $2, 2001)', [randomUUID(), actor]),
        );
        expect(code(error)).toBe('22023');

        const loan = await client.query<{ interest_amount: string }>(
          'SELECT interest_amount::text FROM public.bank_borrow($1, $2, 2000)',
          [randomUUID(), actor],
        );
        // 14.4 gives grade C an 8% rate. Before 096 this was 100 -- the flat
        // 5% every grade was charged.
        expect(loan.rows[0]?.interest_amount).toBe('160');
      });
    });

    it('records the grade’s own term rather than a fixed one', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await earnGradeC(client, actor);
        await client.query('SELECT public.bank_borrow($1, $2, 500)', [randomUUID(), actor]);
        const loan = await client.query<{ credit_grade: string; days: string }>(
          `SELECT credit_grade,
                  round(extract(epoch FROM maturity_at - clock_timestamp()) / 86400)::text AS days
           FROM public.virtual_bank_loans WHERE user_id = $1`,
          [actor],
        );
        expect(loan.rows[0]?.credit_grade).toBe('C');
        expect(loan.rows[0]?.days).toBe('30');
      });
    });

    /**
     * 14.4: 대출 잔액이 있으면 카지노 이용 제한. Enforced by a trigger on the
     * play rather than inside `casino_play_coin`, so a play inserted by any
     * path is refused -- which is what this asserts by inserting one directly.
     */
    it('refuses a casino play while a loan is outstanding', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await earnGradeC(client, actor);
        await client.query('SELECT public.bank_borrow($1, $2, 500)', [randomUUID(), actor]);

        const error = await rejectionOf(() =>
          client.query(
            `INSERT INTO public.virtual_casino_coin_plays
               (user_id, play_date, stake_amount, net_amount, choice, outcome, idempotency_key)
             VALUES ($1, current_date, 100, -100, 'heads', 'tails', $2)`,
            [actor, randomUUID()],
          ),
        );
        expect(code(error)).toBe('55000');
      });
    });

    it('lets a member with no loan play', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await expect(
          client.query(
            `INSERT INTO public.virtual_casino_coin_plays
               (user_id, play_date, stake_amount, net_amount, choice, outcome, idempotency_key)
             VALUES ($1, current_date, 100, -100, 'heads', 'tails', $2)`,
            [actor, randomUUID()],
          ),
        ).resolves.toBeDefined();
      });
    });

    it('offers the whole ladder, marking the caller’s own rung', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await earnGradeC(client, actor);
        const ladder = await client.query<{ grade: string; held: boolean; interest_bps: number }>(
          'SELECT grade, held, interest_bps FROM public.bank_credit_ladder($1)',
          [actor],
        );
        expect(ladder.rows.map((row) => row.grade).sort()).toEqual(['A', 'B', 'C', 'new']);
        expect(ladder.rows.filter((row) => row.held).map((row) => row.grade)).toEqual(['C']);
        // 14.4 gives the A grade 5%; 076 seeded 400 bps and 096 corrects it.
        expect(ladder.rows.find((row) => row.grade === 'A')?.interest_bps).toBe(500);
      });
    });

    /** 14.8's three, which nothing sold before 096. */
    it('sells three businesses a first-fortnight member can afford', async () => {
      const catalogue = await migrator.query<{ symbol: string; purchase_cost: string }>(
        `SELECT symbol, purchase_cost::text FROM public.business_catalog()
         WHERE symbol IN ('STALL', 'CART', 'DEPOT') ORDER BY purchase_cost`,
      );
      expect(catalogue.rows).toEqual([
        { symbol: 'STALL', purchase_cost: '3000' },
        { symbol: 'CART', purchase_cost: '5000' },
        { symbol: 'DEPOT', purchase_cost: '8000' },
      ]);
    });
  });
});
