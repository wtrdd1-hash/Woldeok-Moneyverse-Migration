import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresClubRepository } from './club.repository';

const url = process.env.WARFARE_V632_TEST_URL;
const isolated = process.env.WARFARE_V632_ISOLATED === 'yes'
  && typeof url === 'string'
  && /^postgresql:\/\/moneyverse_app:[^@]+@127\.0\.0\.1:55593\/mv_b_v632$/.test(url);

describe.runIf(isolated)('warfare page verified club source: isolated PostgreSQL 17', () => {
  const pool = new Pool({ connectionString: url, max: 2 });
  const repository = new PostgresClubRepository(pool);
  const alice = '11111111-2222-4333-8444-555555555555';
  const bob = '66666666-7777-4888-8999-aaaaaaaaaaaa';
  afterAll(async () => { await pool.end(); });

  it('returns real club identities and actor-bound membership flags, never invented tax state', async () => {
    const aliceRows = await repository.listClubs(alice, undefined, 50, 0);
    const bobRows = await repository.listClubs(bob, undefined, 50, 0);
    expect(aliceRows).toHaveLength(2);
    expect(bobRows).toHaveLength(2);
    expect(aliceRows.find((row) => row.tag === 'ALICE')?.is_my_club).toBe(true);
    expect(aliceRows.find((row) => row.tag === 'BOB')?.is_my_club).toBe(false);
    expect(bobRows.find((row) => row.tag === 'BOB')?.is_my_club).toBe(true);
    expect(bobRows.find((row) => row.tag === 'ALICE')?.is_my_club).toBe(false);
    expect(JSON.stringify(aliceRows)).not.toMatch(/unclaimedTaxWld|accumulatedTaxPoolWld|club-valhalla/);
  });

  it('preserves least privilege for the app role in the synthetic fixture', async () => {
    await expect(pool.query('UPDATE public.clubs SET name = name')).rejects.toMatchObject({ code: '42501' });
    await expect(pool.query('DELETE FROM public.club_members')).rejects.toMatchObject({ code: '42501' });
  });
});
