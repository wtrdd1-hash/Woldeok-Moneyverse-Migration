import { describe, expect, it, vi } from 'vitest';
import { TreasuryRepository } from './treasury.repository';
import type { Queryable } from '../../core/db';

const vault = {
  id: '00000000-0000-4000-8000-000000000001',
  code: 'VAULT_MAIN', name: 'Main', balance_wld: '123456789',
  description: '', created_at: new Date(), updated_at: new Date(),
};

function repository() {
  const query = vi.fn(async (sql: string) => {
    if (sql.includes('FROM public.system_treasury_vaults') && sql.includes('ORDER BY')) return { rows: [vault] };
    if (sql.includes('sum(balance_wld')) return { rows: [{ total: '123456789' }] };
    if (sql.includes('sum(ab.available_amount)')) return { rows: [{ total: '1000' }] };
    if (sql.includes('daily_avg')) return { rows: [{ daily_avg: '100' }] };
    return { rows: [] };
  });
  return { repo: new TreasuryRepository({ query } as unknown as Queryable), query };
}

describe('P1 treasury reconciliation evidence integrity', () => {
  it('does not manufacture RECONCILED or a zero discrepancy in overview', async () => {
    const { repo } = repository();
    const result = await repo.getOverview();
    expect(result.total_treasury_wld).toBe('123456789');
    expect(result.reconciliation).toMatchObject({
      status: 'UNVERIFIED',
      total_vaults_balance_wld: '123456789',
      total_ledger_net_flow_wld: null,
      discrepancy_amount_wld: null,
      last_reconciled_at: null,
    });
  });

  it('does not invent a ledger reconciliation on the standalone endpoint', async () => {
    const { repo, query } = repository();
    const result = await repo.getReconciliation();
    expect(result).toMatchObject({
      status: 'UNVERIFIED',
      total_vaults_balance_wld: '123456789',
      total_ledger_net_flow_wld: null,
      discrepancy_amount_wld: null,
      last_reconciled_at: null,
    });
    expect(query).toHaveBeenCalledTimes(1);
  });
});
