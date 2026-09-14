import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { rejectionOf } from '../testing/database';

const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

describe.skipIf(!MIGRATOR_DATABASE_URL)('work daily quota contract', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    await pool.end();
  });

  const rolledBack = async (body: (client: PoolClient) => Promise<void>): Promise<void> => {
    const client = await pool.connect();
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
      `INSERT INTO public.accounts (account_type, owner_user_id)
       VALUES ('USER_CASH', $1)`,
      [id],
    );
    await client.query(
      `INSERT INTO public.account_balances (account_id)
       SELECT account_row.id
       FROM public.accounts AS account_row
       WHERE account_row.owner_user_id = $1`,
      [id],
    );
    return id;
  };

  const limitedTask = async (
    client: PoolClient,
    excludedJob?: string,
  ): Promise<{ id: string; jobType: string; dailyLimit: number }> => {
    const result = await client.query<{
      id: string;
      job_type: string;
      daily_limit: number;
    }>(
      `SELECT id, job_type::text, daily_limit
       FROM public.work_task_catalog
       WHERE active
         AND daily_limit > 0
         AND ($1::text IS NULL OR job_type::text <> $1)
       ORDER BY daily_limit, job_type::text, code
       LIMIT 1`,
      [excludedJob ?? null],
    );
    const row = result.rows[0];
    if (!row) throw new Error('no limited work task is seeded');
    return { id: row.id, jobType: row.job_type, dailyLimit: row.daily_limit };
  };

  const complete = async (client: PoolClient, actor: string, taskId: string): Promise<void> => {
    await client.query('SELECT * FROM public.work_complete_task_v2($1, $2, $3)', [
      actor,
      taskId,
      randomUUID(),
    ]);
  };

  it('publishes the catalogue limit and completed count on the work board', async () => {
    await rolledBack(async (client) => {
      const actor = await member(client);
      const task = await limitedTask(client);
      await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, task.jobType]);

      const before = await client.query<{ daily_limit: number; taken_today: number }>(
        'SELECT daily_limit, taken_today FROM public.work_task_board($1) WHERE task_id = $2',
        [actor, task.id],
      );
      expect(before.rows[0]?.daily_limit).toBe(task.dailyLimit);
      expect(before.rows[0]?.taken_today).toBe(0);

      await complete(client, actor, task.id);

      const after = await client.query<{ daily_limit: number; taken_today: number }>(
        'SELECT daily_limit, taken_today FROM public.work_task_board($1) WHERE task_id = $2',
        [actor, task.id],
      );
      expect(after.rows[0]?.daily_limit).toBe(task.dailyLimit);
      expect(after.rows[0]?.taken_today).toBe(1);
    });
  });

  it('allows filling the configured daily amount and rejects only the next completion', async () => {
    await rolledBack(async (client) => {
      const actor = await member(client);
      const task = await limitedTask(client);
      await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, task.jobType]);

      for (let index = 0; index < task.dailyLimit; index += 1) {
        await complete(client, actor, task.id);
      }

      const board = await client.query<{ daily_limit: number; taken_today: number }>(
        'SELECT daily_limit, taken_today FROM public.work_task_board($1) WHERE task_id = $2',
        [actor, task.id],
      );
      expect(board.rows[0]).toEqual({ daily_limit: task.dailyLimit, taken_today: task.dailyLimit });

      const error = await rejectionOf(() => complete(client, actor, task.id));
      expect((error as { code?: string }).code).toBe('22023');
      expect(String((error as { message?: string }).message)).toContain('daily completion limit reached');
    });
  });

  it('keeps quotas isolated when the member switches to another profession', async () => {
    await rolledBack(async (client) => {
      const actor = await member(client);
      const first = await limitedTask(client);
      const second = await limitedTask(client, first.jobType);

      await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, first.jobType]);
      for (let index = 0; index < first.dailyLimit; index += 1) {
        await complete(client, actor, first.id);
      }

      await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, second.jobType]);
      await complete(client, actor, second.id);

      const board = await client.query<{ taken_today: number }>(
        'SELECT taken_today FROM public.work_task_board($1) WHERE task_id = $2',
        [actor, second.id],
      );
      expect(board.rows[0]?.taken_today).toBe(1);
    });
  });
});
