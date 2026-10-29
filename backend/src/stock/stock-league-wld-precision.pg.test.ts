import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { StockLeagueRepository } from './stock-league.repository';

// Explicitly isolated disposable PostgreSQL only; never use the shared development DB.
const url = process.env.STOCK_LEAGUE_V634_PG_URL;
const pool = url ? new Pool({ connectionString: url }) : null;
afterAll(async () => { await pool?.end(); });

describe.skipIf(!pool)('stock league exact WLD read against isolated PostgreSQL', () => {
  it('rejects rounded NUMERIC and does not require write privileges', async () => {
    const repo = new StockLeagueRepository(pool!);
    await expect(repo.getCurrentSeason()).rejects.toMatchObject({ status: 503 });
    await expect(pool!.query('UPDATE public.stock_league_seasons SET entry_fee = 1'))
      .rejects.toMatchObject({ code: '42501' });
  });
});
