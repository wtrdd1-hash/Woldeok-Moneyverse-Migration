import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migrations 066-070, executed.
 *
 * The work loop mints currency, so the cases that matter are the ones that
 * decide how much and for whom: the caps, the repeat decay, and who is still
 * allowed to be paid. Everything runs as the schema owner inside a
 * transaction that is rolled back, because a committed reward would move the
 * ledger for every later test in the run.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the work loop against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the work tables unreadable by the application role', async () => {
    for (const table of [
      'work_task_catalog',
      'work_assignments',
      'work_reward_receipts',
      'work_reward_windows',
      'user_job_progress',
      'work_reward_policy_versions',
    ]) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(
        String((error as { message?: string }).message),
        `${table} must be reachable only through a function`,
      ).toMatch(/permission denied/i);
    }
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('paying for work', () => {
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

    /** A member with the two accounts the auth upsert would have given them. */
    const member = async (client: PoolClient): Promise<string> => {
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
      return id;
    };

    const task = async (client: PoolClient, code: string): Promise<{ id: string; reward: string }> => {
      const { rows } = await client.query<{ id: string; base_reward: string }>(
        'SELECT id::text, base_reward::text FROM public.work_task_catalog WHERE code = $1',
        [code],
      );
      const row = rows[0];
      if (!row) throw new Error(`the ${code} task was not seeded`);
      return { id: row.id, reward: row.base_reward };
    };

    /** Assign, then backdate so the minimum duration has passed. */
    const assigned = async (client: PoolClient, actor: string, taskId: string): Promise<string> => {
      const key = randomUUID();
      await client.query('SELECT * FROM public.work_assign_task($1, $2, $3)', [key, actor, taskId]);
      await client.query(
        `UPDATE public.work_assignments SET assigned_at = assigned_at - interval '2 hours'
         WHERE id = $1`,
        [key],
      );
      return key;
    };

    it('returns the task that was assigned on a replay, not the one the caller repeated', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const first = await task(client, 'logistics_sorting');
        const other = await task(client, 'farm_care');
        const key = randomUUID();

        await client.query('SELECT * FROM public.work_assign_task($1, $2, $3)', [
          key,
          actor,
          first.id,
        ]);
        const { rows } = await client.query<{ task_id: string; replayed: boolean }>(
          'SELECT assignment.task_id::text, assignment.replayed FROM public.work_assign_task($1, $2, $3) AS assignment',
          [key, actor, other.id],
        );

        expect(rows[0]?.replayed).toBe(true);
        expect(rows[0]?.task_id, 'a replay must report what was stored').toBe(first.id);
      });
    });

    it('refuses a second caller reusing somebody else’s key', async () => {
      await rolledBack(async (client) => {
        const owner = await member(client);
        const stranger = await member(client);
        const chosen = await task(client, 'logistics_sorting');
        const key = randomUUID();

        await client.query('SELECT * FROM public.work_assign_task($1, $2, $3)', [
          key,
          owner,
          chosen.id,
        ]);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.work_assign_task($1, $2, $3)', [
            key,
            stranger,
            chosen.id,
          ]),
        );
        expect(code(error)).toBe('28000');
      });
    });

    it('holds the daily limit for a task', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const chosen = await task(client, 'farm_care'); // daily_limit 2

        await client.query('SELECT * FROM public.work_assign_task($1, $2, $3)', [
          randomUUID(),
          actor,
          chosen.id,
        ]);
        await client.query('SELECT * FROM public.work_assign_task($1, $2, $3)', [
          randomUUID(),
          actor,
          chosen.id,
        ]);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.work_assign_task($1, $2, $3)', [
            randomUUID(),
            actor,
            chosen.id,
          ]),
        );
        expect(code(error)).toBe('23505');
      });
    });

    it('refuses a submission before the task has taken its minimum time', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const chosen = await task(client, 'mine_survey');
        const key = randomUUID();
        await client.query('SELECT * FROM public.work_assign_task($1, $2, $3)', [
          key,
          actor,
          chosen.id,
        ]);

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.work_submit_completion($1, $2, $3, NULL)', [
            randomUUID(),
            actor,
            key,
          ]),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('pays the base reward and records a receipt', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const chosen = await task(client, 'logistics_sorting');
        const assignment = await assigned(client, actor, chosen.id);
        await client.query('SELECT * FROM public.work_submit_completion($1, $2, $3, NULL)', [
          randomUUID(),
          actor,
          assignment,
        ]);

        const key = randomUUID();
        const { rows } = await client.query<{ reward_amount: string; transaction_id: string }>(
          `SELECT reward.reward_amount::text, reward.transaction_id::text
           FROM public.work_verify_and_reward($1, $2, $3) AS reward`,
          [key, actor, assignment],
        );
        expect(rows[0]?.reward_amount).toBe(chosen.reward);
        expect(rows[0]?.transaction_id).toBeTruthy();

        const { rows: balance } = await client.query<{ available_amount: string }>(
          `SELECT balance_row.available_amount::text
           FROM public.account_balances AS balance_row
           JOIN public.accounts AS account_row ON account_row.id = balance_row.account_id
           WHERE account_row.owner_user_id = $1
             AND account_row.account_type = 'USER_CASH'::public.account_type`,
          [actor],
        );
        expect(balance[0]?.available_amount).toBe(chosen.reward);

        // Same key, same answer, one payment.
        const { rows: replay } = await client.query<{ replayed: boolean; reward_amount: string }>(
          `SELECT reward.replayed, reward.reward_amount::text
           FROM public.work_verify_and_reward($1, $2, $3) AS reward`,
          [key, actor, assignment],
        );
        expect(replay[0]?.replayed).toBe(true);
        expect(replay[0]?.reward_amount).toBe(chosen.reward);
      });
    });

    it('clamps the reward to whatever is left of the daily cap', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const chosen = await task(client, 'logistics_sorting');
        await client.query(
          `INSERT INTO public.work_reward_policy_versions (daily_cap, weekly_cap, reason)
           VALUES (10, 2200, 'a cap this test can exhaust')`,
        );
        const assignment = await assigned(client, actor, chosen.id);
        await client.query('SELECT * FROM public.work_submit_completion($1, $2, $3, NULL)', [
          randomUUID(),
          actor,
          assignment,
        ]);

        const { rows } = await client.query<{ reward_amount: string }>(
          `SELECT reward.reward_amount::text
           FROM public.work_verify_and_reward($1, $2, $3) AS reward`,
          [randomUUID(), actor, assignment],
        );
        expect(rows[0]?.reward_amount).toBe('10');
      });
    });

    it('stops paying a member who has been restricted', async () => {
      // The regression this exists for: the mint path filtered
      // `accounts.status`, which `admin_set_user_restriction` never touches,
      // so a member restricted for economy abuse kept being paid.
      await rolledBack(async (client) => {
        const actor = await member(client);
        const chosen = await task(client, 'logistics_sorting');
        const assignment = await assigned(client, actor, chosen.id);
        await client.query('SELECT * FROM public.work_submit_completion($1, $2, $3, NULL)', [
          randomUUID(),
          actor,
          assignment,
        ]);

        await client.query(
          "UPDATE public.users SET status = 'restricted'::public.user_status WHERE id = $1",
          [actor],
        );

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.work_verify_and_reward($1, $2, $3)', [
            randomUUID(),
            actor,
            assignment,
          ]),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('answers the dashboard with a row even when rewards are switched off', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('UPDATE public.work_reward_policy_versions SET enabled = false');

        const { rows } = await client.query<{ daily_cap: string; active_assignments: string }>(
          `SELECT summary.daily_cap::text, summary.active_assignments::text
           FROM public.work_my_dashboard($1) AS summary`,
          [actor],
        );
        // One row, not none: the route would otherwise answer 200 with an
        // empty body, which the page cannot tell apart from "nothing earned".
        expect(rows).toHaveLength(1);
        expect(rows[0]?.daily_cap).toBe('0');
      });
    });
  });
});
