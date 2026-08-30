import { randomUUID } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { databaseUrl, rejectionOf } from './testing/database';

/**
 * Migrations 081-082, executed.
 *
 * Five of the seven tables this feature adds had no writer at all before
 * these functions existed, so the interesting cases are the ones that write:
 * progress that completes, a reward that lands, a signal nobody has to
 * remember to report.
 */
const DATABASE_URL = databaseUrl();
const MIGRATOR_DATABASE_URL = process.env.MIGRATOR_DATABASE_URL;

function code(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: unknown }).code)
    : undefined;
}

describe.skipIf(!DATABASE_URL)('the engagement loop against a real database', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('keeps the engagement tables unreadable by the application role', async () => {
    for (const table of [
      'engagement_catalog',
      'engagement_progress',
      'engagement_progress_receipts',
      'npc_relationships',
      'collection_entries',
      'member_activity_signals',
      'member_engagement_preferences',
    ]) {
      const error = await rejectionOf(() => pool.query(`SELECT * FROM public.${table}`));
      expect(String((error as { message?: string }).message), table).toMatch(/permission denied/i);
    }
  });

  describe.skipIf(!MIGRATOR_DATABASE_URL)('recording progress', () => {
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
      return id;
    };

    it('completes a quest and hands over the title it promises', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const { rows } = await client.query<{ progress: number; completed: boolean }>(
          `SELECT recorded.progress, recorded.completed
           FROM public.engagement_record_progress($1, $2, 'first_wage', 1) AS recorded`,
          [randomUUID(), actor],
        );
        expect(rows[0]?.progress).toBe(1);
        expect(rows[0]?.completed).toBe(true);

        const { rows: titles } = await client.query<{ count: string }>(
          `SELECT count(*)::text AS count FROM public.user_titles AS holding
           JOIN public.member_titles AS title ON title.id = holding.title_id
           WHERE holding.user_id = $1 AND title.code = 'starter'`,
          [actor],
        );
        expect(titles[0]?.count).toBe('1');
      });
    });

    it('counts a retried request once', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const key = randomUUID();
        await client.query('SELECT * FROM public.engagement_record_progress($1, $2, $3, 1)', [
          key,
          actor,
          'weekly_variety',
        ]);
        const { rows } = await client.query<{ progress: number; replayed: boolean }>(
          `SELECT recorded.progress, recorded.replayed
           FROM public.engagement_record_progress($1, $2, $3, 1) AS recorded`,
          [key, actor, 'weekly_variety'],
        );
        expect(rows[0]?.replayed).toBe(true);
        expect(rows[0]?.progress).toBe(1);
      });
    });

    it('refuses a receipt that belongs to somebody else', async () => {
      await rolledBack(async (client) => {
        const owner = await member(client);
        const stranger = await member(client);
        const key = randomUUID();
        await client.query('SELECT * FROM public.engagement_record_progress($1, $2, $3, 1)', [
          key,
          owner,
          'first_wage',
        ]);
        const error = await rejectionOf(() =>
          client.query('SELECT * FROM public.engagement_record_progress($1, $2, $3, 1)', [
            key,
            stranger,
            'first_wage',
          ]),
        );
        expect(code(error)).toBe('28000');
      });
    });

    it('unlocks the collection entry a weekly goal promises', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        for (let index = 0; index < 3; index += 1) {
          await client.query('SELECT * FROM public.engagement_record_progress($1, $2, $3, 1)', [
            randomUUID(),
            actor,
            'weekly_variety',
          ]);
        }
        const { rows } = await client.query<{ collection_code: string }>(
          'SELECT collection_code FROM public.collection_entries WHERE user_id = $1',
          [actor],
        );
        expect(rows[0]?.collection_code).toBe('weekly');
      });
    });

    it('notes a work reward without anybody reporting it', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        const { rows: task } = await client.query<{ id: string }>(
          "SELECT id::text FROM public.work_task_catalog WHERE code = 'logistics_sorting'",
        );
        const assignment = randomUUID();
        await client.query(
          `INSERT INTO public.work_assignments (id, user_id, task_id, expires_at)
           VALUES ($1, $2, $3, clock_timestamp() + interval '1 day')`,
          [assignment, actor, task[0]?.id],
        );
        await client.query(
          `INSERT INTO public.work_reward_receipts
             (idempotency_key, user_id, assignment_id, reward_amount, experience_amount)
           VALUES ($1, $2, $3, 10, 10)`,
          [randomUUID(), actor, assignment],
        );

        const { rows } = await client.query<{ repeated_task_count: number }>(
          'SELECT repeated_task_count FROM public.member_activity_signals WHERE user_id = $1',
          [actor],
        );
        expect(rows[0]?.repeated_task_count).toBe(1);
      });
    });

    it('answers a member at the top stage with no next unlock rather than an empty one', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query(
          "INSERT INTO public.user_progression (user_id, stage_code) VALUES ($1, 'advanced')",
          [actor],
        );
        const { rows } = await client.query<{ next_unlock: unknown }>(
          'SELECT board.next_unlock FROM public.member_engagement_dashboard($1) AS board',
          [actor],
        );
        expect(rows[0]?.next_unlock).toBeNull();
      });
    });

    it('remembers a notification preference', async () => {
      await rolledBack(async (client) => {
        const actor = await member(client);
        await client.query('SELECT public.member_set_engagement_preferences($1, false)', [actor]);
        const { rows } = await client.query<{ notifications_enabled: boolean }>(
          'SELECT board.notifications_enabled FROM public.member_engagement_dashboard($1) AS board',
          [actor],
        );
        expect(rows[0]?.notifications_enabled).toBe(false);
      });
    });
  });
});
