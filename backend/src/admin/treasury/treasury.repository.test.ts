import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../../core/db';
import { TreasuryRepository } from './treasury.repository';

function makeRepository(row: Record<string, string | number>) {
  const query = vi.fn().mockResolvedValue({ rows: [row] });
  const repo = new TreasuryRepository({ query } as unknown as Queryable);
  return { repo, query };
}

const VERIFIED_OPERATOR = '00000000-0000-4000-8000-000000000001';

describe('TreasuryRepository authoritative reconciliation v678', () => {
  it('never labels matching fiscal subsidiary ledger as cross-Economy-Core reconciled', async () => {
    const { repo, query } = makeRepository({
      total_vaults_balance_wld: '400000000000000000000',
      total_ledger_net_flow_wld: '400000000000000000000',
      discrepancy_amount_wld: '0',
      journal_integrity_issues: 0,
    });
    const result = await repo.getReconciliation(VERIFIED_OPERATOR);
    expect(result.status).toBe('UNVERIFIED');
    expect(result.total_vaults_balance_wld).toBe('400000000000000000000');
    expect(result.discrepancy_amount_wld).toBe('0');
    expect(result.journal_integrity_issues).toBe(0);
    expect(query).toHaveBeenCalledOnce();
    const sql: string = query.mock.calls[0][0];
    expect(sql).toContain('public.treasury_admin_reconciliation($1::uuid)');
    expect(query.mock.calls[0][1]).toEqual([VERIFIED_OPERATOR]);
    expect(sql).not.toMatch(/\bUPDATE\b|\bINSERT\b|\bDELETE\b/i);
  });

  it('reports a real per-vault discrepancy even if overall net could cancel', async () => {
    const { repo } = makeRepository({
      total_vaults_balance_wld: '300',
      total_ledger_net_flow_wld: '300',
      discrepancy_amount_wld: '40',
      journal_integrity_issues: 0,
    });
    const result = await repo.getReconciliation(VERIFIED_OPERATOR);
    expect(result.status).toBe('DISCREPANCY');
    expect(result.discrepancy_amount_wld).toBe('40');
  });

  it('reports broken journal continuity when end balances happen to match', async () => {
    const { repo } = makeRepository({
      total_vaults_balance_wld: '500',
      total_ledger_net_flow_wld: '500',
      discrepancy_amount_wld: '0',
      journal_integrity_issues: 2,
    });
    const result = await repo.getReconciliation(VERIFIED_OPERATOR);
    expect(result.status).toBe('DISCREPANCY');
    expect(result.journal_integrity_issues).toBe(2);
  });

  it('does not turn missing evidence or query failure into a green financial claim', async () => {
    const { repo } = makeRepository({
      total_vaults_balance_wld: '0',
      total_ledger_net_flow_wld: '0',
      discrepancy_amount_wld: '0',
      journal_integrity_issues: 0,
    });
    expect((await repo.getReconciliation(VERIFIED_OPERATOR)).status).toBe('UNVERIFIED');

    const broken = new TreasuryRepository({
      query: vi.fn().mockRejectedValue(new Error('db offline')),
    } as unknown as Queryable);
    await expect(broken.getReconciliation(VERIFIED_OPERATOR)).rejects.toThrow('db offline');
  });

  it('withholds overview spendable/coverage when evidence is unverified', async () => {
    const query = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('FROM public.system_treasury_vaults') && sql.includes('ORDER BY code')) {
        return Promise.resolve({ rows: [{
          id: 'vault-main', code: 'VAULT_MAIN', name: 'Main', balance_wld: '1000000',
          description: '', created_at: new Date(), updated_at: new Date(),
        }] });
      }
      if (sql.includes('sum(available_amount)')) return Promise.resolve({ rows: [{ total: '1000000' }] });
      if (sql.includes('FROM public.system_treasury_ledger') && sql.includes('INTERVAL')) return Promise.resolve({ rows: [] });
      if (sql.includes('treasury_admin_reconciliation')) {
        return Promise.resolve({ rows: [{
          total_vaults_balance_wld: '1000000', total_ledger_net_flow_wld: '1000000',
          discrepancy_amount_wld: '0', journal_integrity_issues: 0,
        }] });
      }
      return Promise.resolve({ rows: [] });
    });
    const repo = new TreasuryRepository({ query } as unknown as Queryable);
    vi.spyOn(repo, 'calculateLiveBudgets').mockResolvedValue([]);
    const overview = await repo.getOverview(VERIFIED_OPERATOR);
    expect(overview.reconciliation.status).toBe('UNVERIFIED');
    expect(overview.available_wld).toBe('0');
    expect(overview.coverage_days).toBe(0);
  });
});
