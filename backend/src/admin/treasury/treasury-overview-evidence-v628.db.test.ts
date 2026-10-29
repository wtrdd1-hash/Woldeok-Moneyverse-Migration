import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from 'pg';
import { TreasuryRepository } from './treasury.repository';

const raw = process.env.MV_B_V628_DATABASE_URL;
const url = raw ? new URL(raw) : null;
const isolated = url?.hostname === '127.0.0.1' &&
  url.port === '55468' && url.pathname === '/mv_b_v628_evidence';

describe.runIf(isolated)('P1 treasury overview isolated PostgreSQL 17 evidence', () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client({ connectionString: raw });
    await client.connect();
    const db = await client.query('SELECT current_database() AS name');
    expect(db.rows[0]?.name).toBe('mv_b_v628_evidence');
    await client.query('SET ROLE mv_b_v628_app');
  });

  afterAll(async () => {
    if (client) {
      await client.query('RESET ROLE');
      await client.end();
    }
  });

  it('reads actual vault, circulation, outflow and budget evidence as a SELECT-only role', async () => {
    const overview = await new TreasuryRepository(client).getOverview();
    expect(overview.total_treasury_wld).toBe('1000000');
    expect(overview.total_circulating_wld).toBe('500000');
    expect(overview.reserve_ratio_pct).toBe(200);
    expect(overview.coverage_days).toBe(1000);
    expect(overview.reconciliation.status).toBe('UNVERIFIED');
  });

  it('cannot mutate vault balances with the read-only role', async () => {
    await expect(client.query('UPDATE public.system_treasury_vaults SET balance_wld = 1')).rejects.toMatchObject({ code: '42501' });
    const result = await client.query('SELECT balance_wld FROM public.system_treasury_vaults');
    expect(result.rows[0]?.balance_wld).toBe('1000000');
  });
});
