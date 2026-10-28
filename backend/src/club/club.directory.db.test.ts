import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresClubRepository } from './club.repository';

const isolatedUrl = process.env.CLUB_DIRECTORY_TEST_URL;
const isolatedOnly =
  process.env.CLUB_DIRECTORY_ISOLATED_FIXTURE === 'yes' &&
  isolatedUrl === 'postgresql://moneyverse_app@127.0.0.1:55584/mv_b_v611';

describe.runIf(isolatedOnly)('club directory against isolated PostgreSQL synthetic fixture', () => {
  const pool = new Pool({ connectionString: isolatedUrl, max: 2 });
  const repo = new PostgresClubRepository(pool);
  const actor = '11111111-2222-4333-8444-555555555555';

  afterAll(async () => {
    await pool.end();
  });

  it('returns deterministic bounded directory pages as the read-only app role', async () => {
    const first = await repo.listClubs(actor, undefined, 100, 0);
    const second = await repo.listClubs(actor, undefined, 100, 100);
    expect(first).toHaveLength(100);
    expect(second).toHaveLength(5);
    expect(new Set([...first, ...second].map((row) => row.id)).size).toBe(105);
    const filtered = await repo.listClubs(actor, 'Club 105', 1, 0);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe('Club 105');
  });

  it('rejects noncanonical numeric direct calls without database writes', async () => {
    await expect(repo.listClubs(actor, undefined, NaN, 0)).rejects.toThrow(
      'limit must be an integer',
    );
    await expect(repo.listClubs(actor, undefined, 101, 0)).rejects.toThrow(
      'limit must be an integer',
    );
    await expect(repo.listClubs(actor, undefined, 50, 10001)).rejects.toThrow(
      'offset must be an integer',
    );
    await expect(repo.listClubs(actor, undefined, 50, Infinity)).rejects.toThrow(
      'offset must be an integer',
    );
  });

  it('preserves least-privilege writes denied to the application role', async () => {
    await expect(pool.query('UPDATE public.clubs SET status = status')).rejects.toMatchObject({
      code: '42501',
    });
    await expect(pool.query('DELETE FROM public.club_members')).rejects.toMatchObject({
      code: '42501',
    });
  });
});
