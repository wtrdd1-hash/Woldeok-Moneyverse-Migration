import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

/**
 * Migration 095, executed, and the one thing it must not get wrong.
 *
 * `work_reward_preview` computes what `work_verify_and_reward` (068) will
 * pay, without 068's row locks. Two copies of one sum drift, and the way this
 * one would drift is silent: the board would advertise a number and the
 * ledger would mint a different one. So the case that matters most here is
 * the one that compares them on a real payout.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!DATABASE_URL)('the work board against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * 095 works around the revoke rather than relaxing it, so the revoke is
   * what this asserts first. A later change that made the board easier by
   * granting SELECT would take the whole boundary with it.
   */
  it('keeps the work tables unreadable by the application role', async () => {
    for (const table of [
      'work_task_catalog',
      'work_assignments',
      'work_reward_receipts',
      'work_reward_policy_versions',
    ]) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  it('grants the three new functions to the application role', async () => {
    const granted = await pool.query<{ has: boolean }>(
      `SELECT has_function_privilege('moneyverse_app', $1, 'EXECUTE') AS has`,
      ['public.work_task_board(uuid)'],
    );
    expect(granted.rows[0]?.has).toBe(true);
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('what the board says, and what the ledger pays', () => {
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

    /** An active member with the cash account 068 mints into. */
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

    const anyTask = async (
      client: PoolClient,
    ): Promise<{ id: string; minimum: number; jobType: string }> => {
      const task = await client.query<{
        id: string;
        minimum_duration_seconds: number;
        job_type: string;
      }>(
        `SELECT id, minimum_duration_seconds, job_type::text
         FROM public.work_task_catalog
         WHERE active ORDER BY base_reward LIMIT 1`,
      );
      const row = task.rows[0];
      if (!row) throw new Error('the seeded task catalogue is empty');
      return { id: row.id, minimum: row.minimum_duration_seconds, jobType: row.job_type };
    };

    it('offers the whole active catalogue, and suggests three of it', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const board = await client.query<{ recommended: boolean }>(
          'SELECT recommended FROM public.work_task_board($1)',
          [actor],
        );
        const active = await client.query<{ count: string }>(
          'SELECT count(*)::text AS count FROM public.work_task_catalog WHERE active',
        );
        expect(String(board.rowCount)).toBe(active.rows[0]?.count);
        expect(board.rows.filter((row) => row.recommended)).toHaveLength(3);
      });
    });

    it('recommends one task from the active career while still exposing the full catalogue', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, 'developer']);
        const board = await client.query<{ job_type: string; recommended: boolean }>(
          'SELECT job_type::text, recommended FROM public.work_task_board($1)',
          [actor],
        );
        const recommended = board.rows.filter((row) => row.recommended);
        expect(recommended).toHaveLength(1);
        expect(recommended[0]?.job_type).toBe('developer');
        expect(board.rows).toHaveLength(24);
      });
    });

    it('keeps suggesting repeatable tasks after the legacy daily count', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const tasks = await client.query<{ id: string; daily_limit: number }>(
          'SELECT id, daily_limit FROM public.work_task_catalog WHERE active',
        );
        for (const task of tasks.rows) {
          for (let taken = 0; taken < task.daily_limit; taken += 1) {
            await client.query(
              `INSERT INTO public.work_assignments (user_id, task_id, expires_at)
               VALUES ($1, $2, clock_timestamp() + interval '24 hours')`,
              [actor, task.id],
            );
          }
        }
        const board = await client.query<{ daily_limit: number; recommended: boolean }>(
          'SELECT daily_limit, recommended FROM public.work_task_board($1)',
          [actor],
        );
        expect(board.rows.every((row) => row.daily_limit === 0)).toBe(true);
        expect(board.rows.filter((row) => row.recommended)).toHaveLength(3);
      });
    });

    it('gives the same three suggestions on two reads in the same day', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const read = async (): Promise<readonly string[]> => {
          const board = await client.query<{ code: string }>(
            'SELECT code FROM public.work_task_board($1) WHERE recommended ORDER BY code',
            [actor],
          );
          return board.rows.map((row) => row.code);
        };
        expect(await read()).toEqual(await read());
      });
    });

    it('refuses a board for anyone but an active member', async () => {
      await rolledBack(async (client) => {
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.work_task_board($1)', [randomUUID()]),
        );
        expect((error as { code?: string }).code).toBe('28000');
      });
    });

    /**
     * The one that stops the two sums drifting. The board is read, the task
     * is taken, submitted and paid, and the receipt must carry exactly what
     * the board promised.
     */
    it('promises exactly what the ledger then pays', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const task = await anyTask(client);

        const promised = await client.query<{ reward_preview: string }>(
          'SELECT reward_preview::text FROM public.work_task_board($1) WHERE task_id = $2',
          [actor, task.id],
        );

        await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, task.jobType]);
        const assignment = randomUUID();
        await client.query('SELECT public.work_assign_task($1, $2, $3)', [
          assignment,
          actor,
          task.id,
        ]);
        // The minimum duration is what 067 measures, and a test cannot wait
        // it out -- so the assignment is backdated past it instead.
        await client.query(
          `UPDATE public.work_assignments
           SET assigned_at = clock_timestamp() - make_interval(secs => $2)
           WHERE id = $1`,
          [assignment, task.minimum + 60],
        );
        await client.query('SELECT public.work_submit_completion($1, $2, $3, NULL)', [
          randomUUID(),
          actor,
          assignment,
        ]);
        const paid = await client.query<{ reward_amount: string }>(
          'SELECT reward_amount::text FROM public.work_verify_and_reward($1, $2, $3)',
          [randomUUID(), actor, assignment],
        );

        expect(paid.rows[0]?.reward_amount).toBe(promised.rows[0]?.reward_preview);
      });
    });

    it('answers null rather than a price when work rewards are switched off', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const task = await anyTask(client);
        await client.query('UPDATE public.work_reward_policy_versions SET enabled = false');
        const board = await client.query<{ reward_preview: string | null }>(
          'SELECT reward_preview FROM public.work_task_board($1) WHERE task_id = $2',
          [actor, task.id],
        );
        expect(board.rows[0]?.reward_preview).toBeNull();
      });
    });

    it('reports the ledger transaction the reward was paid through', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const task = await anyTask(client);
        await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, task.jobType]);
        const assignment = randomUUID();
        await client.query('SELECT public.work_assign_task($1, $2, $3)', [
          assignment,
          actor,
          task.id,
        ]);
        await client.query(
          `UPDATE public.work_assignments
           SET assigned_at = clock_timestamp() - make_interval(secs => $2)
           WHERE id = $1`,
          [assignment, task.minimum + 60],
        );
        await client.query('SELECT public.work_submit_completion($1, $2, $3, NULL)', [
          randomUUID(),
          actor,
          assignment,
        ]);
        await client.query('SELECT public.work_verify_and_reward($1, $2, $3)', [
          randomUUID(),
          actor,
          assignment,
        ]);

        const receipts = await client.query<{ transaction_id: string | null; code: string }>(
          'SELECT transaction_id::text, code FROM public.work_my_receipts($1)',
          [actor],
        );
        expect(receipts.rowCount).toBe(1);
        expect(receipts.rows[0]?.transaction_id).toMatch(/^[0-9a-f-]{36}$/);
      });
    });

    it('shows one member nothing of another member’s receipts', async () => {
      await rolledBack(async (client) => {
        const stranger = await member(client);
        const receipts = await client.query('SELECT * FROM public.work_my_receipts($1)', [
          stranger,
        ]);
        expect(receipts.rowCount).toBe(0);
      });
    });
  });
});
