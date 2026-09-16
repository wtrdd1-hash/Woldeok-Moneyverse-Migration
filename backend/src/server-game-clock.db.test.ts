import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const DATABASE_URL = process.env.DATABASE_URL;

describe.skipIf(!DATABASE_URL)('accelerated server game clock', () => {
  let pool: Pool;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 1 });
  });

  afterAll(async () => {
    await pool.end();
  });

  it('maps ten real minutes to one server day', async () => {
    const { rows } = await pool.query(
      `SELECT day_index::text, week_index::text, day_of_week,
              real_seconds_per_day, game_days_per_week,
              day_started_at, day_ends_at
       FROM public.server_game_clock($1::timestamptz)`,
      ['2026-09-15T00:10:00+09:00'],
    );

    expect(rows[0]).toMatchObject({
      day_index: '1',
      week_index: '0',
      day_of_week: 2,
      real_seconds_per_day: 600,
      game_days_per_week: 7,
    });
  });

  it('maps seventy real minutes to the next server week', async () => {
    const { rows } = await pool.query(
      `SELECT day_index::text, week_index::text, day_of_week,
              week_started_at, week_ends_at
       FROM public.server_game_clock($1::timestamptz)`,
      ['2026-09-15T01:10:00+09:00'],
    );

    expect(rows[0]).toMatchObject({
      day_index: '7',
      week_index: '1',
      day_of_week: 1,
    });
  });

  it('keeps the work dashboard on the authoritative server day and week keys', async () => {
    const actor = randomUUID();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('INSERT INTO public.users (id) VALUES ($1)', [actor]);
      const { rows: keys } = await client.query<{ day_key: string; week_key: string }>(
        `SELECT public.server_game_day_key()::text AS day_key,
                public.server_game_week_key()::text AS week_key`,
      );
      const dayKey = keys[0]?.day_key;
      const weekKey = keys[0]?.week_key;
      if (!dayKey || !weekKey) throw new Error('server game keys were not returned');

      await client.query(
        `INSERT INTO public.work_reward_windows (user_id, window_start, window_kind, paid_amount)
         VALUES ($1, $2::date, 'day', 111), ($1, $3::date, 'week', 222)`,
        [actor, dayKey, weekKey],
      );

      const { rows } = await client.query<{ daily_paid: string; weekly_paid: string }>(
        `SELECT daily_paid::text, weekly_paid::text FROM public.work_my_dashboard($1)`,
        [actor],
      );
      expect(rows[0]).toMatchObject({ daily_paid: '111', weekly_paid: '222' });
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
