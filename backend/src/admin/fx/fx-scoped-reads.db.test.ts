import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { FxRepository } from './fx.repository';

// The CI and isolated-PostgreSQL job provide a least-privilege app connection.
// Never point this test at a deployed or shared database.
const url = process.env.DATABASE_URL;
describe.skipIf(!url)('FX public read functions as moneyverse_app on real PostgreSQL', () => {
  let pool: Pool;
  let repo: FxRepository;
  beforeAll(() => {
    pool = new Pool({ connectionString: url, max: 2 });
    repo = new FxRepository(pool);
  });
  afterAll(async () => { await pool?.end(); });

  it('can read the public reserve projection and bounded history', async () => {
    const reserve = await repo.getReserveStatus();
    expect(reserve.currency).toBe('USD');
    expect(Number.isFinite(reserve.currentRate)).toBe(true);
    const history = await repo.getRateHistory(10000);
    expect(history.length).toBeLessThanOrEqual(100);
    expect(history.every((point) => Number.isFinite(point.rate))).toBe(true);
    expect(await repo.getLatestRate()).toBe(reserve.currentRate);
  });

  it('can read public SDR and swap projections without owner-level transactions', async () => {
    expect(await repo.getSdrAllocations()).toBeInstanceOf(Array);
    expect(await repo.getSwapAgreements()).toBeInstanceOf(Array);
  });

  it('cannot directly read or mutate the underlying FX source tables', async () => {
    for (const table of ['foreign_exchange_reserves', 'foreign_exchange_rates',
      'foreign_exchange_asset_allocations', 'currency_swap_agreements']) {
      await expect(pool.query(`SELECT 1 FROM public.${table} LIMIT 1`)).rejects.toMatchObject({ code: '42501' });
      const rights = await pool.query(
        'SELECT has_table_privilege(current_user, $1, $2) AS allowed',
        [`public.${table}`, 'INSERT,UPDATE,DELETE,TRUNCATE'],
      );
      expect(rights.rows[0]?.allowed).toBe(false);
    }
  });
});
