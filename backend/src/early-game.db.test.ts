import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, isMissingGrant, reachLendingGrade, rejectionOf } from './testing/database';

/**
 * Migration 101, executed.
 *
 * The claim this file has to defend is that nothing on the early-game screens
 * is a member's own word for what they did. Every unlock and every goal is
 * asserted against a row that a reward payment or a ledger transaction wrote,
 * and two of the tests exist only to prove a shortcut was NOT taken: a stock
 * buy reaches the sink exactly as a purchase does and must not count as
 * spending, and `engagement_record_progress` -- the one function in this
 * schema that will award a member anything on their say-so -- must not be able
 * to move any of these numbers.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

interface GoalRow {
  readonly goal_code: string;
  readonly goal_progress: string;
  readonly goal_completed: boolean;
  readonly goal_self_reported: boolean;
}

interface UnlockRow {
  readonly unlock_code: string;
  readonly unlocked: boolean;
  readonly is_enforced: boolean;
  readonly next_up: boolean;
  readonly needs_job_level: number;
  readonly needs_account_days: number;
  readonly needs_work_completions: number;
  readonly member_job_level: number;
  readonly member_work_completions: number;
}

interface BookRow {
  readonly book_code: string;
  readonly entry_total: number;
  readonly entry_unlocked: number;
  readonly reward_held: boolean;
  readonly entries: readonly {
    readonly code: string;
    readonly unlocked: boolean;
    readonly unlocked_at: string | null;
  }[];
}

describe.skipIf(!DATABASE_URL)('the early game against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the four seeded tables unreadable by the application role', async () => {
    for (const table of [
      'early_unlock_ladder',
      'early_weekly_goal_catalog',
      'early_collection_books',
      'early_collection_book_entries',
    ]) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  // A 42501 phrased as "permission denied" would mean the GRANT never landed
  // and the screens answer 500 in production; 28000 is the function correctly
  // declining an actor who is not an active member. Only the second is right.
  it('grants the application role execute on all three reads', async () => {
    const stranger = randomUUID();
    for (const fn of ['early_game_unlocks', 'early_game_weekly_goals', 'early_game_collections']) {
      const error = await rejectionOf(() =>
        pool.query(`SELECT * FROM public.${fn}($1)`, [stranger]),
      );
      expect(isMissingGrant(error), fn).toBe(false);
      expect(code(error), fn).toBe('28000');
    }
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('what the ladder, the goals and the books count', () => {
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

    /** A member with both accounts and some cash to spend. */
    const member = async (client: PoolClient, funding = 6000): Promise<string> => {
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
             jsonb_build_object('accountId', $3::uuid, 'amount', $5::bigint, 'direction', 'credit'),
             jsonb_build_object('accountId', $4::uuid, 'amount', $5::bigint, 'direction', 'debit')
           ), 'test.funded', '{}'::jsonb)`,
        [randomUUID(), id, rows[0]?.mint, rows[0]?.cash, String(funding)],
      );
      return id;
    };

    /**
     * One paid task, without walking assign-submit-verify. The receipt is what
     * every count in 101 reads, so the receipt is what these tests arrange --
     * and inserting it here also fires 101's title trigger, which is the point
     * of the collection cases.
     */
    const paidTask = async (client: PoolClient, actor: string, task: string): Promise<void> => {
      const { rows } = await client.query<{ id: string }>(
        'SELECT id::text AS id FROM public.work_task_catalog WHERE code = $1',
        [task],
      );
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
    };

    const atLevel = async (
      client: PoolClient,
      actor: string,
      job: string,
      level: number,
    ): Promise<void> => {
      await client.query(
        `INSERT INTO public.user_job_progress (user_id, job_type, experience, level)
         VALUES ($1, $2::public.work_job_type, $3, $4)
         ON CONFLICT (user_id, job_type) DO UPDATE SET level = excluded.level`,
        [actor, job, level * 100, level],
      );
    };

    const unlocks = async (client: PoolClient, actor: string): Promise<UnlockRow[]> => {
      const { rows } = await client.query<UnlockRow>(
        'SELECT * FROM public.early_game_unlocks($1)',
        [actor],
      );
      return rows;
    };

    const goal = async (client: PoolClient, actor: string, name: string): Promise<GoalRow> => {
      const { rows } = await client.query<GoalRow>(
        `SELECT goal.goal_code, goal.goal_progress::text, goal.goal_completed,
                goal.goal_self_reported
         FROM public.early_game_weekly_goals($1) AS goal
         WHERE goal.goal_code = $2`,
        [actor, name],
      );
      const row = rows[0];
      if (!row) throw new Error(`the goal catalogue is missing ${name}`);
      return row;
    };

    const rung = (rows: readonly UnlockRow[], name: string): UnlockRow => {
      const row = rows.find((candidate) => candidate.unlock_code === name);
      if (!row) throw new Error(`the ladder is missing ${name}`);
      return row;
    };

    it('opens the first rung to a member who has done nothing at all', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const ladder = await unlocks(client, actor);

        // 066 gives every job row a level of at least one and a member with no
        // row can still take basic work, so the first rung is open on the day
        // an account is made. Reporting it as locked would be the ladder's
        // first sentence being wrong.
        expect(rung(ladder, 'basic_start').unlocked).toBe(true);
        expect(rung(ladder, 'basic_start').member_job_level).toBe(1);
        expect(rung(ladder, 'stall_business').unlocked).toBe(false);
        expect(rung(ladder, 'delivery_depot').unlocked).toBe(false);
      });
    });

    it('opens the 중고 판매대 rung at the job level it names, from the real level', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await atLevel(client, actor, 'carrier', 4);
        expect(rung(await unlocks(client, actor), 'stall_business').unlocked).toBe(false);

        await atLevel(client, actor, 'carrier', 5);
        const ladder = await unlocks(client, actor);
        expect(rung(ladder, 'stall_business').unlocked).toBe(true);
        expect(rung(ladder, 'stall_business').member_job_level).toBe(5);
        // The next thing that is actually refused, not the next row. A level-5
        // member who joined today still has the credit rung ahead of them --
        // it wants seven days and ten paid tasks, neither of which a level
        // buys -- so that is what they are working towards, and the business
        // above them is not. `job_focus` is the rung this must never pick: it
        // is below both and nothing enforces it, so offering it would send a
        // member to work for something they can already do.
        expect(rung(ladder, 'credit_c_loan').next_up).toBe(true);
        expect(rung(ladder, 'street_cart').next_up).toBe(false);
        expect(rung(ladder, 'job_focus').next_up).toBe(false);

        // And it moves. Once the credit rung is behind them the next lock is
        // the next business, which is the ordering 16.1 describes.
        await reachLendingGrade(client, actor);
        const climbed = await unlocks(client, actor);
        expect(rung(climbed, 'credit_c_loan').unlocked).toBe(true);
        expect(rung(climbed, 'street_cart').next_up).toBe(true);
      });
    });

    // 16.1 carries rungs this schema does not gate. They are shown as the plan,
    // and `is_enforced` is how a screen tells the two apart -- a ladder that
    // claimed a lock which does not exist would be worse than no ladder.
    it('marks the rungs nothing refuses as unenforced', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const ladder = await unlocks(client, actor);
        expect(rung(ladder, 'job_focus').is_enforced).toBe(false);
        expect(rung(ladder, 'member_trade').is_enforced).toBe(false);
        expect(rung(ladder, 'pro_equipment').is_enforced).toBe(false);
        expect(rung(ladder, 'stall_business').is_enforced).toBe(true);
        expect(rung(ladder, 'credit_c_loan').is_enforced).toBe(true);
      });
    });

    // The rung and the bank must never disagree: the ladder takes its two
    // thresholds from `bank_credit_policies`, which is the table
    // `bank_credit_grade` reads, so a member told they may borrow can.
    it('agrees with the bank about the C grade, before and after', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        expect(rung(await unlocks(client, actor), 'credit_c_loan').unlocked).toBe(false);

        await reachLendingGrade(client, actor);
        const ladder = await unlocks(client, actor);
        expect(rung(ladder, 'credit_c_loan').unlocked).toBe(true);
        expect(rung(ladder, 'credit_c_loan').needs_account_days).toBe(7);
        expect(rung(ladder, 'credit_c_loan').needs_work_completions).toBe(10);
        expect(rung(ladder, 'credit_c_loan').member_work_completions).toBe(10);

        const { rows } = await client.query<{ grade: string | null }>(
          'SELECT public.bank_credit_grade($1) AS grade',
          [actor],
        );
        expect(rows[0]?.grade, 'the ladder and the bank must not disagree').toBe('C');
      });
    });

    it('refuses a 중고 판매대 below level 5 and sells it at level 5', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const { rows } = await client.query<{ id: string }>(
          "SELECT id::text AS id FROM public.virtual_business_types WHERE symbol = 'STALL'",
        );
        const stall = rows[0]?.id;

        // The savepoint is taken BEFORE the refusal, not after it. A statement
        // that raises aborts the transaction, and an aborted transaction will
        // not accept a SAVEPOINT either -- so asking for one afterwards fails
        // with 25P02 rather than recovering.
        await client.query('SAVEPOINT before_refusal');
        const refused = await rejectionOf(() =>
          client.query('SELECT * FROM public.business_purchase($1, $2, $3)', [
            randomUUID(),
            actor,
            stall,
          ]),
        );
        await client.query('ROLLBACK TO SAVEPOINT before_refusal');
        expect(code(refused)).toBe('22023');

        await atLevel(client, actor, 'carrier', 5);
        const { rows: bought } = await client.query<{ purchase_cost: string }>(
          `SELECT purchased.purchase_cost::text
           FROM public.business_purchase($1, $2, $3) AS purchased`,
          [randomUUID(), actor, stall],
        );
        expect(bought[0]?.purchase_cost).toBe('3000');
      });
    });

    // The three businesses 036 seeded belong to 16.2 and 16.3 and carry no rung.
    // A gate that caught them would take away something 16.1 never gated.
    it('leaves a business the ladder does not name alone', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client, 30000);
        const { rows } = await client.query<{ id: string }>(
          "SELECT id::text AS id FROM public.virtual_business_types WHERE symbol = 'CAFE'",
        );
        const { rows: bought } = await client.query<{ purchase_cost: string }>(
          `SELECT purchased.purchase_cost::text
           FROM public.business_purchase($1, $2, $3) AS purchased`,
          [randomUUID(), actor, rows[0]?.id],
        );
        expect(bought[0]?.purchase_cost).toBe('25000');
      });
    });

    it('counts kinds of work and not repetitions of one', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await paidTask(client, actor, 'logistics_sorting');
        await paidTask(client, actor, 'logistics_sorting');
        expect((await goal(client, actor, 'weekly_distinct_tasks')).goal_progress).toBe('1');

        await paidTask(client, actor, 'farm_care');
        expect((await goal(client, actor, 'weekly_distinct_tasks')).goal_progress).toBe('2');
      });
    });

    it('counts only the tasks of the job the member has the most levels in', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await atLevel(client, actor, 'carrier', 6);
        await atLevel(client, actor, 'farmer', 2);

        await paidTask(client, actor, 'logistics_sorting');
        await paidTask(client, actor, 'delivery_run');
        await paidTask(client, actor, 'farm_care');

        // Two carrier tasks and one farmer task; the farmer task is somebody
        // else's job and must not count towards 직업 작업 7회.
        expect((await goal(client, actor, 'weekly_job_tasks')).goal_progress).toBe('2');
      });
    });

    it('counts a shop purchase as spending and a stock buy as not', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const { rows } = await client.query<{ id: string; cash: string; sink: string }>(
          `SELECT (SELECT id::text FROM public.shop_catalog WHERE code = 'repair_kit') AS id,
                  (SELECT id::text FROM public.accounts
                   WHERE owner_user_id = $1 AND account_type = 'USER_CASH') AS cash,
                  (SELECT id::text FROM public.accounts WHERE system_key = 'sink') AS sink`,
          [actor],
        );

        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
          randomUUID(),
          actor,
          rows[0]?.id,
        ]);
        expect((await goal(client, actor, 'weekly_spend_or_save')).goal_progress).toBe('80');

        // A stock buy credits the same account and debits the same sink. If the
        // goal counted "money that reached the sink" this would move it, and a
        // member could finish 소비 1,000 WLD at the coin table or the exchange
        // without buying anything.
        await client.query(
          `SELECT public.economy_post_transaction(
             $1, 'VIRTUAL_STOCK_BUY', $2, NULL,
             jsonb_build_array(
               jsonb_build_object('accountId', $3::uuid, 'amount', 900, 'direction', 'credit'),
               jsonb_build_object('accountId', $4::uuid, 'amount', 900, 'direction', 'debit')
             ), 'test.stock', '{}'::jsonb)`,
          [randomUUID(), actor, rows[0]?.cash, rows[0]?.sink],
        );
        expect((await goal(client, actor, 'weekly_spend_or_save')).goal_progress).toBe('80');
      });
    });

    it('nets a withdrawal against the deposit it undoes', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query("SELECT public.bank_move_balance($1, $2, 'deposit', 1000)", [
          randomUUID(),
          actor,
        ]);
        const saved = await goal(client, actor, 'weekly_spend_or_save');
        expect(saved.goal_progress).toBe('1000');
        expect(saved.goal_completed).toBe(true);

        await client.query("SELECT public.bank_move_balance($1, $2, 'withdraw', 1000)", [
          randomUUID(),
          actor,
        ]);
        // Otherwise depositing and withdrawing the same thousand five times
        // would read as having saved five thousand.
        const undone = await goal(client, actor, 'weekly_spend_or_save');
        expect(undone.goal_progress).toBe('0');
        expect(undone.goal_completed).toBe(false);
      });
    });

    /**
     * The whole reason this feature computes rather than counts.
     *
     * `engagement_record_progress` will award a member progress and a title on
     * their own say-so, which is why no route reaches it. Even called directly
     * it must not be able to move an early-game goal by one, because these
     * goals read receipts and postings and nothing else.
     */
    it('cannot be moved by a member reporting their own progress', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const before = await Promise.all([
          goal(client, actor, 'weekly_distinct_tasks'),
          goal(client, actor, 'weekly_job_tasks'),
          goal(client, actor, 'weekly_spend_or_save'),
        ]);
        expect(before.map((row) => row.goal_progress)).toEqual(['0', '0', '0']);

        for (const reported of ['first_wage', 'weekly_variety', 'wise_spending']) {
          await client.query('SELECT * FROM public.engagement_record_progress($1, $2, $3, 1000)', [
            randomUUID(),
            actor,
            reported,
          ]);
        }

        const after = await Promise.all([
          goal(client, actor, 'weekly_distinct_tasks'),
          goal(client, actor, 'weekly_job_tasks'),
          goal(client, actor, 'weekly_spend_or_save'),
        ]);
        expect(after.map((row) => row.goal_progress)).toEqual(['0', '0', '0']);
      });
    });

    // One of the four is a button and says so. A screen that rendered it like
    // the other three would be claiming a verification that does not exist.
    it('marks the NPC goal as self-reported and the other three as not', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        expect((await goal(client, actor, 'weekly_npc_regular')).goal_self_reported).toBe(true);
        expect((await goal(client, actor, 'weekly_distinct_tasks')).goal_self_reported).toBe(false);
        expect((await goal(client, actor, 'weekly_job_tasks')).goal_self_reported).toBe(false);
        expect((await goal(client, actor, 'weekly_spend_or_save')).goal_self_reported).toBe(false);
      });
    });

    it('fills a page of the 도감 from the receipt that earned it', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await paidTask(client, actor, 'logistics_sorting');

        const { rows } = await client.query<BookRow>(
          `SELECT * FROM public.early_game_collections($1) WHERE book_code = 'job_sampler'`,
          [actor],
        );
        const book = rows[0];
        // Four pages, not 16.1's five: 070's catalogue has no 상인 task, so a
        // fifth page could never be filled and the title behind the book could
        // never be awarded.
        expect(book?.entry_total).toBe(4);
        expect(book?.entry_unlocked).toBe(1);
        const carrier = book?.entries.find((entry) => entry.code === 'carrier');
        expect(carrier?.unlocked).toBe(true);
        expect(carrier?.unlocked_at, 'the page carries the moment the work paid').not.toBeNull();
        expect(book?.entries.find((entry) => entry.code === 'miner')?.unlocked).toBe(false);
      });
    });

    it('awards the title when the last page is filled, and not before', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await paidTask(client, actor, 'logistics_sorting');
        await paidTask(client, actor, 'farm_care');
        await paidTask(client, actor, 'mine_survey');

        const { rows: partial } = await client.query<BookRow>(
          `SELECT * FROM public.early_game_collections($1) WHERE book_code = 'job_sampler'`,
          [actor],
        );
        expect(partial[0]?.entry_unlocked).toBe(3);
        expect(partial[0]?.reward_held).toBe(false);

        await paidTask(client, actor, 'equipment_inspection');
        const { rows: complete } = await client.query<BookRow>(
          `SELECT * FROM public.early_game_collections($1) WHERE book_code = 'job_sampler'`,
          [actor],
        );
        expect(complete[0]?.entry_unlocked).toBe(4);
        // Granted by the trigger on the receipt that completed it, not by a
        // button and not by a sweep nobody has scheduled.
        expect(complete[0]?.reward_held).toBe(true);

        const { rows: held } = await client.query<{ code: string }>(
          `SELECT title_row.code
           FROM public.user_titles AS holding_row
           JOIN public.member_titles AS title_row ON title_row.id = holding_row.title_id
           WHERE holding_row.user_id = $1`,
          [actor],
        );
        expect(held.map((row) => row.code)).toContain('job_explorer');
      });
    });

    it('fills a page of the tool 도감 from a purchase', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const { rows: item } = await client.query<{ id: string }>(
          "SELECT id::text AS id FROM public.shop_catalog WHERE code = 'repair_kit'",
        );
        await client.query('SELECT * FROM public.shop_purchase_catalog($1, $2, $3, 1)', [
          randomUUID(),
          actor,
          item[0]?.id,
        ]);

        const { rows } = await client.query<BookRow>(
          `SELECT * FROM public.early_game_collections($1) WHERE book_code = 'starter_tools'`,
          [actor],
        );
        expect(rows[0]?.entry_total).toBe(10);
        expect(rows[0]?.entry_unlocked).toBe(1);
        expect(rows[0]?.entries.find((entry) => entry.code === 'repair_kit')?.unlocked).toBe(true);
        // Nine pages still empty, so the title is not owed yet.
        expect(rows[0]?.reward_held).toBe(false);
      });
    });
  });
});
