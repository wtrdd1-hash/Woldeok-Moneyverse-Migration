import { Client } from 'pg';
import { describe, expect, it } from 'vitest';
import { TreasuryRepository } from './treasury.repository';

const url = process.env.MV_V1603_ISOLATED_DATABASE_URL;
const host = url ? new URL(url) : null;
const allowed = host?.hostname === '127.0.0.1' && ['5580','5585'].includes(host?.port ?? '') &&
  host?.pathname === '/wdmv_v1553_fiscal_reset';

// Never silently connect to a regular shared Production/Test database.
describe.runIf(allowed)('v1603 restored-production-data isolated Treasury read proof', () => {
  it('certifies post-epoch 0 without spending old archived WLD using application-role SQL', async () => {
    const c = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
    await c.connect();
    try {
      await c.query('SET ROLE moneyverse_app');
      const id = await c.query('SELECT current_database() db, current_user actor');
      expect(id.rows[0]).toEqual({ db: 'wdmv_v1553_fiscal_reset', actor: 'moneyverse_app' });
      const repo = new TreasuryRepository(c);
      const [overview, reconciliation] = await Promise.all([
        repo.getOverview(), repo.getReconciliation(),
      ]);
      expect(reconciliation).toMatchObject({
        status: 'RECONCILED',
        total_vaults_balance_wld: '0',
        total_ledger_net_flow_wld: '0',
        discrepancy_amount_wld: '0',
      });
      expect(overview.total_treasury_wld).toBe('0');
      expect(overview.available_wld).toBe('0');
      expect(overview.reserve_wld).toBe('0');
      expect(overview.reconciliation.status).toBe('RECONCILED');
      expect(overview.stats_24h).toEqual({
        injected_wld: '0', absorbed_wld: '0',
        stock_halt_funded_wld: '0', recirculated_wld: '0',
      });
      expect(overview.coverage_days).toBeUndefined();
      expect(overview.budgets.every((b) => b.settled_wld === '0')).toBe(true);
      const denied = await c.query(
        "SELECT has_table_privilege(current_user,'public.ledger_postings','DELETE') d, has_table_privilege(current_user,'public.treasury_fiscal_epochs','INSERT') i"
      );
      expect(denied.rows[0]).toEqual({ d: false, i: false });
    } finally {
      await c.end();
    }
  });
});
