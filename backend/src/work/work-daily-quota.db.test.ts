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
      await client.query(
        `INSERT INTO public.work_reward_policy_versions
           (daily_cap, weekly_cap, repeat_decay_percent, enabled, reason)
         VALUES (999999999, 999999999, 0, true, 'per-task quota test isolation')`,
      );
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

      const board = await client.query<{
        daily_limit: number;
        taken_today: number;
        reward_preview: string;
      }>(
        'SELECT daily_limit, taken_today, reward_preview::text FROM public.work_task_board($1) WHERE task_id = $2',
        [actor, task.id],
      );
      expect(board.rows[0]).toEqual({
        daily_limit: task.dailyLimit,
        taken_today: task.dailyLimit,
        reward_preview: '0',
      });

      const error = await rejectionOf(() => complete(client, actor, task.id));
      expect((error as { code?: string }).code).toBe('22023');
      expect(String((error as { message?: string }).message)).toContain(
        'daily completion limit reached',
      );
    });
  });

  it('enforces the administrator member-wide daily cap on direct completion', async () => {
    await rolledBack(async (client) => {
      const actor = await member(client);
      const task = await limitedTask(client);
      await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, task.jobType]);
      await client.query(
        `INSERT INTO public.work_reward_policy_versions
           (daily_cap, weekly_cap, repeat_decay_percent, enabled, reason)
         VALUES (10, 2200, 0, true, 'global cap regression test')`,
      );

      const previewBefore = await client.query<{ reward_preview: string }>(
        `SELECT public.work_reward_preview($1,$2)::text AS reward_preview`,
        [actor, task.id],
      );
      expect(previewBefore.rows[0]?.reward_preview).toBe('10');

      const first = await client.query<{ reward_amount: string }>(
        `SELECT reward_amount::text FROM public.work_complete_task_v2($1,$2,$3)`,
        [actor, task.id, randomUUID()],
      );
      expect(first.rows[0]?.reward_amount).toBe('10');

      const previewAfter = await client.query<{ reward_preview: string }>(
        `SELECT public.work_reward_preview($1,$2)::text AS reward_preview`,
        [actor, task.id],
      );
      expect(previewAfter.rows[0]?.reward_preview).toBe('0');

      const dashboard = await client.query<{
        daily_paid: string;
        daily_cap: string;
        weekly_paid: string;
        weekly_cap: string;
        game_day_key: string;
        game_week_key: string;
        day_ends_at: Date;
        week_ends_at: Date;
      }>(
        `SELECT daily_paid::text, daily_cap::text, weekly_paid::text, weekly_cap::text,
                game_day_key::text, game_week_key::text, day_ends_at, week_ends_at
         FROM public.work_my_dashboard_v2($1)`,
        [actor],
      );
      const keys = await client.query<{ day_key: string; week_key: string }>(
        `SELECT public.server_game_day_key()::text AS day_key,
                public.server_game_week_key()::text AS week_key`,
      );
      expect(dashboard.rows[0]).toMatchObject({
        daily_paid: '10',
        daily_cap: '10',
        weekly_paid: '10',
        weekly_cap: '2200',
        game_day_key: keys.rows[0]?.day_key,
        game_week_key: keys.rows[0]?.week_key,
      });
      expect(dashboard.rows[0]?.day_ends_at.getTime()).toBeGreaterThan(Date.now() - 1_000);
      expect(dashboard.rows[0]?.week_ends_at.getTime()).toBeGreaterThan(Date.now() - 1_000);

      const legacy = await client.query<{ daily_paid: string; weekly_paid: string }>(
        `SELECT daily_paid::text, weekly_paid::text FROM public.work_my_dashboard($1)`,
        [actor],
      );
      expect(legacy.rows[0]).toEqual({ daily_paid: '10', weekly_paid: '10' });

      const windows = await client.query<{ day_amount: string; week_amount: string }>(
        `SELECT
           coalesce(max(paid_amount) FILTER (WHERE window_kind = 'day' AND window_start = public.server_game_day_key()), 0)::text AS day_amount,
           coalesce(max(paid_amount) FILTER (WHERE window_kind = 'week' AND window_start = public.server_game_week_key()), 0)::text AS week_amount
         FROM public.work_reward_windows
         WHERE user_id = $1`,
        [actor],
      );
      expect(windows.rows[0]).toEqual({ day_amount: '10', week_amount: '10' });

      const error = await rejectionOf(() => complete(client, actor, task.id));
      expect((error as { code?: string }).code).toBe('22023');
      expect(String((error as { message?: string }).message)).toContain(
        'work reward quota reached',
      );
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
