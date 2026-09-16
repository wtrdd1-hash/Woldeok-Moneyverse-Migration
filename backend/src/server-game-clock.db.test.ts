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

  it('changes the authoritative day and week keys only at their exact accelerated boundaries', async () => {
    const { rows } = await pool.query<{
      day_before: string;
      day_at: string;
      day_after: string;
      week_before: string;
      week_at: string;
      week_after: string;
    }>(
      `SELECT
         public.server_game_day_key('2026-09-15T00:09:59+09:00'::timestamptz)::text AS day_before,
         public.server_game_day_key('2026-09-15T00:10:00+09:00'::timestamptz)::text AS day_at,
         public.server_game_day_key('2026-09-15T00:10:01+09:00'::timestamptz)::text AS day_after,
         public.server_game_week_key('2026-09-15T01:09:59+09:00'::timestamptz)::text AS week_before,
         public.server_game_week_key('2026-09-15T01:10:00+09:00'::timestamptz)::text AS week_at,
         public.server_game_week_key('2026-09-15T01:10:01+09:00'::timestamptz)::text AS week_after`,
    );

    expect(rows[0]?.day_before).not.toBe(rows[0]?.day_at);
    expect(rows[0]?.day_at).toBe(rows[0]?.day_after);
    expect(rows[0]?.week_before).not.toBe(rows[0]?.week_at);
    expect(rows[0]?.week_at).toBe(rows[0]?.week_after);
  });

  it('keeps game day/week keys independent of the database session timezone', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL TIME ZONE 'UTC'`);
      const utc = await client.query<{ day_key: string; week_key: string }>(
        `SELECT public.server_game_day_key('2026-09-15T01:10:00+09:00'::timestamptz)::text AS day_key,
                public.server_game_week_key('2026-09-15T01:10:00+09:00'::timestamptz)::text AS week_key`,
      );
      await client.query(`SET LOCAL TIME ZONE 'America/New_York'`);
      const newYork = await client.query<{ day_key: string; week_key: string }>(
        `SELECT public.server_game_day_key('2026-09-15T01:10:00+09:00'::timestamptz)::text AS day_key,
                public.server_game_week_key('2026-09-15T01:10:00+09:00'::timestamptz)::text AS week_key`,
      );
      expect(newYork.rows[0]).toEqual(utc.rows[0]);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });
});
