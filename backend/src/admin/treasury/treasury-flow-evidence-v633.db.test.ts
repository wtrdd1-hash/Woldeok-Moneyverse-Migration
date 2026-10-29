import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TreasuryRepository } from './treasury.repository';

const connection = process.env.TREASURY_V633_ISOLATED_DATABASE_URL;
const isolated = (() => {
  if (!connection) return false;
  const url = new URL(connection);
  return url.hostname === '127.0.0.1' && url.port === '55433' && url.pathname === '/mv_b_v633_isolated';
})();

describe.skipIf(!isolated)('P1 treasury flow isolated PostgreSQL 17 evidence', () => {
  let reader: Pool;
  let admin: Pool;
  beforeAll(() => {
    reader = new Pool({ connectionString: connection, max: 1 });
    admin = new Pool({ connectionString: connection!.replace('mv_b_v633_reader:reader_local', 'postgres:postgres_local'), max: 1 });
  });
  afterAll(async () => { await reader?.end(); await admin?.end(); });

  it('reads real revenue and expenditure totals using read-only least privilege', async () => {
    const repo = new TreasuryRepository(reader);
    expect((await repo.getRevenue()).total_30d_wld).toBe('50');
    expect((await repo.getExpenditure()).total_30d_wld).toBe('20');
    await expect(reader.query('UPDATE public.system_treasury_ledger SET amount_wld = 999')).rejects.toMatchObject({ code: '42501' });
  });

  it('returns 503, not zero WLD, when the application role loses SELECT', async () => {
    await admin.query('REVOKE SELECT ON public.system_treasury_ledger FROM mv_b_v633_reader');
    const repo = new TreasuryRepository(reader);
    await expect(repo.getRevenue()).rejects.toMatchObject({ status: 503, response: { code: 'TREASURY_REVENUE_EVIDENCE_UNAVAILABLE' } });
    await expect(repo.getExpenditure()).rejects.toMatchObject({ status: 503, response: { code: 'TREASURY_EXPENDITURE_EVIDENCE_UNAVAILABLE' } });
  });
});
