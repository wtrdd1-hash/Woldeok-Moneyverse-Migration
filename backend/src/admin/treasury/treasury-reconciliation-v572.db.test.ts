import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { TreasuryRepository } from './treasury.repository';

// Intentionally not DATABASE_URL: this fixture must never touch the shared
// development/production-linked Moneyverse database.
const url = process.env.TREASURY_V572_ISOLATED_DATABASE_URL;
const isolated = (() => {
  if (!url) return false;
  const parsed = new URL(url);
  return parsed.hostname === '127.0.0.1' && parsed.pathname === '/moneyverse_v572_isolated';
})();

describe.skipIf(!isolated)('P1 treasury reconciliation read-only real PostgreSQL', () => {
  let pool: Pool;
  beforeAll(() => { pool = new Pool({ connectionString: url, max: 1 }); });
  afterAll(async () => { await pool?.end(); });

  it('returns the real vault sum but never a fabricated verified ledger total', async () => {
    const result = await new TreasuryRepository(pool).getReconciliation();
    expect(result).toEqual({
      status: 'UNVERIFIED',
      total_vaults_balance_wld: '123456789',
      total_ledger_net_flow_wld: null,
      discrepancy_amount_wld: null,
      last_reconciled_at: null,
    });
  });

  it('preserves least privilege: fixture reader cannot modify vault balances', async () => {
    await expect(pool.query("UPDATE public.system_treasury_vaults SET balance_wld=0")).rejects.toMatchObject({ code: '42501' });
    const rows = await pool.query<{ balance_wld: string }>('SELECT balance_wld::text FROM public.system_treasury_vaults');
    expect(rows.rows[0]?.balance_wld).toBe('123456789');
  });
});
