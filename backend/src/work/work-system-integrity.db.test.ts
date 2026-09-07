import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from '../testing/database';

const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL || !MIGRATOR_DATABASE_URL)(
  'the consolidated career work system against a real database',
  () => {
    let app: Pool;
    let migrator: Pool;

    beforeAll(() => {
      app = new Pool({ connectionString: DATABASE_URL, max: 1 });
      migrator = new Pool({ connectionString: MIGRATOR_DATABASE_URL, max: 1 });
    });

    afterAll(async () => {
      await Promise.all([app.end(), migrator.end()]);
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
      const actor = randomUUID();
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
      await client.query(
        `INSERT INTO public.accounts (account_type, owner_user_id)
         VALUES ('USER_CASH', $1), ('USER_BANK', $1)`,
        [actor],
      );
      await client.query(
        `INSERT INTO public.account_balances (account_id)
         SELECT account_row.id FROM public.accounts AS account_row
         WHERE account_row.owner_user_id = $1`,
        [actor],
      );
      return actor;
    };

    it('publishes exactly three tasks for each of the eight professional careers', async () => {
      const rows = await migrator.query<{ job_type: string; count: string }>(
        `SELECT job_type::text, count(*)::text AS count
         FROM public.work_task_catalog
         WHERE active
         GROUP BY job_type
         ORDER BY job_type`,
      );
      expect(rows.rows).toHaveLength(8);
      expect(rows.rows.every((row) => row.count === '3')).toBe(true);
      expect(rows.rows.reduce((sum, row) => sum + Number(row.count), 0)).toBe(24);
    });

    it('uses one square-threshold level curve everywhere', async () => {
      const rows = await migrator.query<{ exp: string; level: number }>(
        `SELECT sample.exp::text, public.job_level_for_experience(sample.exp) AS level
         FROM unnest(ARRAY[0,99,100,399,400,900,15931]::bigint[]) AS sample(exp)`,
      );
      expect(rows.rows.map((row) => [row.exp, row.level])).toEqual([
        ['0', 1],
        ['99', 1],
        ['100', 2],
        ['399', 2],
        ['400', 3],
        ['900', 4],
        ['15931', 13],
      ]);
    });

    it('enforces one active career and switches atomically', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, 'developer']);
        await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, 'trader']);
        const active = await client.query<{ job_type: string }>(
          `SELECT job_type::text FROM public.user_job_progress
           WHERE user_id = $1 AND is_active`,
          [actor],
        );
        expect(active.rows).toEqual([{ job_type: 'trader' }]);

        const error = await rejectionOf(() =>
          client.query(
            `INSERT INTO public.user_job_progress
             (user_id, job_type, experience, level, is_active)
             VALUES ($1, 'developer', 0, 1, true)
             ON CONFLICT (user_id, job_type) DO UPDATE SET is_active = true`,
            [actor],
          ),
        );
        expect(code(error)).toBe('23505');
      });
    });

    it('refuses assigning work from a different career', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, 'developer']);
        const task = await client.query<{ id: string }>(
          `SELECT id::text FROM public.work_task_catalog
           WHERE code = 'trd_orderbook' AND active`,
        );
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.work_assign_task($1, $2, $3)', [
            randomUUID(),
            actor,
            task.rows[0]?.id,
          ]),
        );
        expect(code(error)).toBe('22023');
      });
    });

    it('shows and pays the same level-aware WLD and EXP', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, 'developer']);
        await client.query(
          `UPDATE public.user_job_progress SET experience = 100, level = 2
           WHERE user_id = $1 AND job_type = 'developer'`,
          [actor],
        );
        const task = await client.query<{ id: string }>(
          `SELECT id::text FROM public.work_task_catalog
           WHERE code = 'dev_refactor' AND active`,
        );
        const taskId = task.rows[0]?.id;
        const preview = await client.query<{ wld: string; exp: string }>(
          `SELECT public.work_reward_preview($1,$2)::text AS wld,
                  public.work_experience_preview($1,$2)::text AS exp`,
          [actor, taskId],
        );
        expect(preview.rows[0]).toEqual({ wld: '231', exp: '37' });

        const result = await client.query<{
          reward_amount: string;
          experience_gained: string;
          current_level: number;
          current_experience: string;
        }>(
          `SELECT reward_amount::text, experience_gained::text,
                  current_level, current_experience::text
           FROM public.work_complete_task_v2($1,$2,$3)`,
          [actor, taskId, randomUUID()],
        );
        expect(result.rows[0]).toEqual({
          reward_amount: '231',
          experience_gained: '37',
          current_level: 2,
          current_experience: '137',
        });
      });
    });

    it('stops both previews and direct completion when work rewards are disabled', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('SELECT * FROM public.job_switch_active($1, $2)', [actor, 'developer']);
        const task = await client.query<{ id: string }>(
          `SELECT id::text FROM public.work_task_catalog
           WHERE code = 'dev_refactor' AND active`,
        );
        const taskId = task.rows[0]?.id;
        await client.query('UPDATE public.work_reward_policy_versions SET enabled = false');

        const preview = await client.query<{ wld: string | null; exp: string | null }>(
          `SELECT public.work_reward_preview($1,$2)::text AS wld,
                  public.work_experience_preview($1,$2)::text AS exp`,
          [actor, taskId],
        );
        expect(preview.rows[0]).toEqual({ wld: null, exp: null });

        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.work_complete_task_v2($1,$2,$3)', [
            actor,
            taskId,
            randomUUID(),
          ]),
        );
        expect(code(error)).toBe('55000');
      });
    });

    it('retires the fixed hourly wallet work faucet without deleting its history', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const policy = await client.query<{ enabled: boolean }>(
          'SELECT enabled FROM public.work_reward_policy WHERE singleton',
        );
        expect(policy.rows[0]?.enabled).toBe(false);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.economy_claim_work($1,$2)', [randomUUID(), actor]),
        );
        expect(code(error)).toBe('55000');
      });
    });
  },
);
