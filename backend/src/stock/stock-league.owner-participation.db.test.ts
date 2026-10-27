import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { StockLeagueRepository } from './stock-league.repository';

const url = process.env.STOCK_LEAGUE_TEST_DATABASE_URL;
const db = url ? new Pool({ connectionString: url, max: 2 }) : null;
const repo = db ? new StockLeagueRepository(db) : null;
const season = '00000000-0000-4000-8000-000000000100';
const member = '00000000-0000-4000-8000-000000000200';
const stranger = '00000000-0000-4000-8000-000000000300';

afterAll(async () => { await db?.end(); });

describe.skipIf(!db)('isolated real PostgreSQL: owner-only league participation', () => {
  it('finds member outside public leaderboard without exposing other members', async () => {
    const own = await repo!.getMyParticipation(season, member);
    expect(own?.userId).toBe(member);
    expect(own?.rankPosition).toBe(37);
    expect(await repo!.getMyParticipation(season, stranger)).toBeNull();
  });

  it('does not leak the same member across seasons', async () => {
    expect(await repo!.getMyParticipation('00000000-0000-4000-8000-000000000999', member)).toBeNull();
  });

  it('does not grant the application role direct financial/participant writes', async () => {
    await expect(db!.query(
      'UPDATE public.stock_league_participants SET current_asset = current_asset + 1 WHERE user_id = $1::uuid',
      [member],
    )).rejects.toMatchObject({ code: '42501' });
  });
});
