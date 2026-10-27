import { afterAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { TreasuryRepository } from './treasury.repository';

const isolatedUrl = process.env.TREASURY_DONOR_TEST_URL;
const isolatedOnly = process.env.TREASURY_DONOR_ISOLATED_FIXTURE === 'yes'
  && typeof isolatedUrl === 'string'
  && /^postgresql:\/\/[^@]+@127\.0\.0\.1:55598\/mv_b_v597_donors$/.test(isolatedUrl);

describe.runIf(isolatedOnly)('treasury donor ranking against isolated PostgreSQL', () => {
  const pool = new Pool({ connectionString: isolatedUrl, max: 2 });
  const repository = new TreasuryRepository(pool);

  afterAll(async () => { await pool.end(); });

  it('returns exact large WLD amounts, stable tie ordering and bounded results', async () => {
    const donors = await repository.getTopDonors(2);
    expect(donors).toHaveLength(2);
    expect(donors.map((donor: { user_id: string }) => donor.user_id)).toEqual([
      '11111111-2222-4333-8444-555555555551',
      '11111111-2222-4333-8444-555555555552',
    ]);
    expect(donors[0]?.total_donated_wld).toBe('9007199254740993');
    expect(donors[1]?.total_donated_wld).toBe('9007199254740993');
    expect(await repository.getTopDonors(1)).toHaveLength(1);
  });

  it('rejects invalid repository limits before SQL', async () => {
    await expect(repository.getTopDonors(Number.NaN)).rejects.toThrow('limit must be an integer');
    await expect(repository.getTopDonors(101)).rejects.toThrow('limit must be an integer');
  });

  it('denies app-role mutation of donor and identity data', async () => {
    await expect(pool.query('UPDATE public.treasury_donations SET amount_wld = 0')).rejects.toMatchObject({ code: '42501' });
    await expect(pool.query('DELETE FROM public.users')).rejects.toMatchObject({ code: '42501' });
  });
});
