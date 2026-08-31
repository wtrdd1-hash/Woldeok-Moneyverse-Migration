import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, reachLendingGrade, rejectionOf } from '../testing/database';

/**
 * Migration 105, executed.
 *
 * The claim this file defends is that a business cannot be bought with the
 * bank's money. The only way to get 14.4's 자기자본 최소 30% quietly wrong is to
 * count a balance a loan put there, so borrow-then-buy is the case that
 * matters -- and the same test buys the same business a moment later, once the
 * member's own money covers the share, because a rule that also refuses what it
 * should allow is not the rule the specification asked for.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

const STANDING_SQL = `SELECT standing_row.holdings_amount::text, standing_row.debt_amount::text,
          standing_row.equity_amount::text, standing_row.minimum_ratio_bps
   FROM public.business_equity_standing($1) AS standing_row`;

interface StandingRow {
  readonly holdings_amount: string;
  readonly debt_amount: string;
  readonly equity_amount: string;
  readonly minimum_ratio_bps: number;
}

function messageOf(error: unknown): string {
  return typeof error === 'object' && error !== null && 'message' in error
    ? String((error as { message?: unknown }).message)
    : '';
}

describe.skipIf(!DATABASE_URL)('the business equity rule against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  // A 42501 phrased as "permission denied" would mean the GRANT never landed,
  // which does not break /businesses -- it silently stops disabling anything.
  it('grants the application role execute on the equity read', async () => {
    const stranger = randomUUID();
    const failure = await rejectionOf(() => pool.query(STANDING_SQL, [stranger]));
    expect(isMissingGrant(failure), 'business_equity_standing must be executable').toBe(false);

    const { rows } = await pool.query<StandingRow>(STANDING_SQL, [stranger]);
    expect(rows[0]?.equity_amount).toBe('0');
    expect(rows[0]?.minimum_ratio_bps).toBe(3000);
  });

  // Both gates, on one table. 101's is the job level and 105's is the money;
  // PostgreSQL fires BEFORE ROW triggers in name order, so the equity gate runs
  // first and neither replaced the other.
  it('keeps both purchase gates on the ownership table', async () => {
    const { rows } = await pool.query<{ tgname: string }>(
      `SELECT trigger_row.tgname
       FROM pg_catalog.pg_trigger AS trigger_row
       WHERE trigger_row.tgrelid = 'public.virtual_business_ownerships'::pg_catalog.regclass
         AND NOT trigger_row.tgisinternal`,
    );
    const names = rows.map((row) => row.tgname);
    expect(names).toContain('virtual_business_ownerships_unlock_gate');
    expect(names).toContain('virtual_business_ownerships_equity_gate');
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('what own capital counts', () => {
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

    const fund = async (client: PoolClient, actor: string, amount: number): Promise<void> => {
      const { rows } = await client.query<{ cash: string; mint: string }>(
        `SELECT (SELECT id::text FROM public.accounts
                 WHERE owner_user_id = $1 AND account_type = 'USER_CASH') AS cash,
                (SELECT id::text FROM public.accounts WHERE system_key = 'mint') AS mint`,
        [actor],
      );
      await client.query(
        `SELECT public.economy_post_transaction(
           $1, 'ADMIN_ADJUSTMENT', $2, NULL,
           jsonb_build_array(
             jsonb_build_object('accountId', $3::uuid, 'amount', $5::bigint, 'direction', 'credit'),
             jsonb_build_object('accountId', $4::uuid, 'amount', $5::bigint, 'direction', 'debit')
           ), 'test.funded', '{}'::jsonb)`,
        [randomUUID(), actor, rows[0]?.mint, rows[0]?.cash, String(amount)],
      );
    };

    const member = async (client: PoolClient, funding: number): Promise<string> => {
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
      await fund(client, id, funding);
      return id;
    };

    /**
     * Grade B, the first grade that can borrow enough for this rule to bite.
     *
     * 096 caps C at 2,000 WLD and the cheapest business is 3,000, so 70% of any
     * price is already more than C lends: no purchase a C-grade member can
     * afford is refusable here. 076 asks B for thirty days and fifty paid
     * tasks, and `reachLendingGrade` arranges the first ten of them.
     */
    const reachExpansionGrade = async (client: PoolClient, actor: string): Promise<void> => {
      await reachLendingGrade(client, actor);
      await client.query(
        `UPDATE public.users SET created_at = clock_timestamp() - interval '40 days' WHERE id = $1`,
        [actor],
      );
      const { rows } = await client.query<{ id: string }>(
        "SELECT id::text AS id FROM public.work_task_catalog WHERE code = 'logistics_sorting'",
      );
      for (let paid = 0; paid < 40; paid += 1) {
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

    const atLevel = async (client: PoolClient, actor: string, level: number): Promise<void> => {
      await client.query(
        `INSERT INTO public.user_job_progress (user_id, job_type, experience, level)
         VALUES ($1, 'carrier'::public.work_job_type, $2, $3)
         ON CONFLICT (user_id, job_type) DO UPDATE SET level = excluded.level`,
        [actor, level * 100, level],
      );
    };

    const standing = async (client: PoolClient, actor: string): Promise<StandingRow> => {
      const { rows } = await client.query<StandingRow>(STANDING_SQL, [actor]);
      const row = rows[0];
      if (!row) throw new Error('the equity standing returned no row');
      return row;
    };

    const businessId = async (client: PoolClient, symbol: string): Promise<string> => {
      const { rows } = await client.query<{ id: string }>(
        'SELECT id::text AS id FROM public.virtual_business_types WHERE symbol = $1',
        [symbol],
      );
      const id = rows[0]?.id;
      if (id === undefined) throw new Error(`the business catalogue is missing ${symbol}`);
      return id;
    };

    const buy = async (client: PoolClient, actor: string, business: string): Promise<string> => {
      const { rows } = await client.query<{ purchase_cost: string }>(
        `SELECT purchased.purchase_cost::text
         FROM public.business_purchase($1, $2, $3) AS purchased`,
        [randomUUID(), actor, business],
      );
      return String(rows[0]?.purchase_cost);
    };

    /**
     * Runs an attempt that must be refused, and leaves the transaction usable.
     *
     * The savepoint is taken BEFORE the raising statement: a statement that
     * raises aborts the transaction, and an aborted transaction will not accept
     * a SAVEPOINT either, so asking for one afterwards fails with 25P02 instead
     * of recovering. And it is rolled back only when the attempt actually
     * failed -- rolling one back either way would erase the work the rest of the
     * test is counting on.
     */
    const refusalOf = async (
      client: PoolClient,
      attempt: () => Promise<unknown>,
    ): Promise<string> => {
      await client.query('SAVEPOINT before_refusal');
      const error = await rejectionOf(attempt);
      if (error === null) {
        await client.query('RELEASE SAVEPOINT before_refusal');
        throw new Error('the purchase was expected to be refused');
      }
      await client.query('ROLLBACK TO SAVEPOINT before_refusal');
      await client.query('RELEASE SAVEPOINT before_refusal');
      return messageOf(error);
    };

    it('counts deposits and positions, and subtracts everything still owed', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 5000);

        // A deposit is not spending. If USER_BANK went uncounted the holdings
        // below would read 1,000 short, and a member could be refused for having
        // saved.
        await client.query('SELECT public.bank_move_balance($1, $2, $3, $4)', [
          randomUUID(),
          actor,
          'deposit',
          '1000',
        ]);

        // Nor is a position. Nothing seeds a stock, so the fixture lists one.
        const symbol = `T${randomUUID().replace(/[^0-9a-f]/gi, '').slice(0, 7).toUpperCase()}`;
        const { rows: listed } = await client.query<{ id: string }>(
          `INSERT INTO public.virtual_stocks
             (symbol, name, initial_price, current_price, day_open_price)
           VALUES ($1, 'fixture stock', 100, 100, 100)
           RETURNING id::text AS id`,
          [symbol],
        );
        await client.query(
          `INSERT INTO public.virtual_stock_positions (user_id, stock_id, quantity, average_cost)
           VALUES ($1, $2, 10, 100)`,
          [actor, listed[0]?.id],
        );

        await reachLendingGrade(client, actor);
        await client.query('SELECT * FROM public.bank_borrow($1, $2, $3)', [
          randomUUID(),
          actor,
          '2000',
        ]);

        const held = await standing(client, actor);
        // 5,000 given, 1,000 of stock, 2,000 lent. The loan raised the holdings
        // and left the own capital exactly where it was.
        expect(held.holdings_amount).toBe('8000');
        // Principal plus the 8% the C grade contracts (096), because that whole
        // figure is what the member owes.
        expect(held.debt_amount).toBe('2160');
        expect(held.equity_amount).toBe('5840');
        expect(held.minimum_ratio_bps).toBe(3000);
      });
    });

    it('refuses a purchase the loan is paying for, and sells it once 30% is the member own money', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 1000);
        await reachExpansionGrade(client, actor);
        await atLevel(client, actor, 10);
        const depot = await businessId(client, 'DEPOT');

        await client.query('SELECT * FROM public.bank_borrow($1, $2, $3)', [
          randomUUID(),
          actor,
          '8000',
        ]);

        // 9,000 in hand and 8,480 of it owed. The balance covers the price, and
        // that is exactly the state 14.4 is about.
        const borrowed = await standing(client, actor);
        expect(borrowed.holdings_amount).toBe('9000');
        expect(borrowed.equity_amount).toBe('520');

        const refusal = await refusalOf(client, () => buy(client, actor, depot));
        // The requirement and the member's own figure, both named, because the
        // screen has to be able to say the same two numbers.
        expect(refusal).toContain('2400');
        expect(refusal).toContain('520');

        // And the capability is not gone. Own money that covers the share buys
        // the same business, with the same loan still outstanding.
        await fund(client, actor, 3000);
        expect((await standing(client, actor)).equity_amount).toBe('3520');
        expect(await buy(client, actor, depot)).toBe('8000');
      });
    });
  });
});
