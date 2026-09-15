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
});
