import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { EnterpriseRepository } from './enterprise.repository';

const url = process.env.MV_V593_PG_URL;
const safeUrl = (() => {
  if (!url) return false;
  const parsed = new URL(url);
  return ['127.0.0.1', 'localhost'].includes(parsed.hostname)
    && parsed.pathname === '/v593_isolated';
})();

describe.skipIf(!safeUrl)('v593 isolated PostgreSQL 17 readonly dividend history', () => {
  let pool: Pool;
  let repository: EnterpriseRepository;
  beforeAll(() => {
    pool = new Pool({ connectionString: url, max: 2 });
    repository = new EnterpriseRepository(pool);
  });
  afterAll(async () => { await pool?.end(); });

  it('returns only the requested bounded number of actual rows', async () => {
    expect((await repository.listRecentDividendLogs(1)).length).toBe(1);
    expect((await repository.listRecentDividendLogs(2)).length).toBe(2);
    expect((await repository.listRecentDividendLogs(100)).length).toBe(3);
  });

  it('never submits invalid direct repository limits to PostgreSQL', async () => {
    for (const invalid of [0, -1, 101, 1.5, NaN, Infinity]) {
      await expect(repository.listRecentDividendLogs(invalid)).rejects.toMatchObject({
        status: 400,
      });
    }
  });

  it('preserves the readonly app fixture privilege boundary', async () => {
    await expect(pool.query(
      'UPDATE public.state_enterprise_dividend_logs SET eval_grade = $1',
      ['F'],
    )).rejects.toMatchObject({ code: '42501' });
    expect((await repository.listRecentDividendLogs(100)).length).toBe(3);
  });
});
