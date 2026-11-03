import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../../core/db';
import { TreasuryRepository } from './treasury.repository';

const vaults = ['VAULT_EMERGENCY','VAULT_INFRA','VAULT_MAIN','VAULT_RESERVE','VAULT_WELFARE'].map((code, i) => ({
  id: String(i + 1), code, name: code, balance_wld: '0',
  description: '', created_at: new Date('2026-10-30'), updated_at: new Date('2026-10-31'),
}));

const certified = {
  database_name: 'woldeok_moneyverse_dev',
  vault_total: '0',
  vault_count: '5',
  canonical_count: '1',
  canonical_total: '0',
  journal_total: '0',
  historic_treasury_count: '552',
  historic_dividend_count: '744',
  expected_treasury_count: '552',
  expected_dividend_count: '744',
  archive_total: '220923528',
  archive_items_total: '220923528',
  archive_items_count: '5',
  backup_sha256: 'e62cc6528e22c3bf60362c4e584d09b01cecef3d9112eb5a0f9e5bcde9e32bc7',
  invalid_new_sources: '0',
  verified_at: new Date('2026-11-01T04:00:00.000Z'),
  epoch_opened_at: new Date('2026-10-31T13:53:31.686Z'),
};

function fixture(proof: Record<string, unknown> | null = certified, circulation = '100000') {
  const query = vi.fn(async (sql: string) => {
    if (sql.includes('public.treasury_fiscal_proof_read()')) return { rows: proof ? [proof] : [] };
    if (sql.includes('FROM public.system_treasury_vaults') && sql.includes('ORDER BY')) return { rows: vaults };
    if (sql.includes('sum(ab.available_amount)')) return { rows: [{ total: circulation }] };
    if (sql.includes('daily_avg')) return { rows: [{ daily_avg: '0' }] };
    if (sql.includes('SELECT amount_wld, tx_type, reason')) return { rows: [] };
    if (sql.includes('GROUP BY tx_type')) return { rows: [] };
    if (sql.includes('sum(balance_wld')) return { rows: [{ total: '0' }] };
    return { rows: [] };
  });
  return { repo: new TreasuryRepository({ query } as unknown as Queryable), query };
}

describe('v1603: current fiscal epoch proof, not archived phantom money', () => {
  it('certifies a read-only, zero-funded current epoch only from canonical and preserved archive evidence', async () => {
    const { repo } = fixture();
    const overview = await repo.getOverview();
    expect(overview.total_treasury_wld).toBe('0');
    expect(overview.reconciliation).toMatchObject({
      status: 'RECONCILED',
      total_vaults_balance_wld: '0',
      total_ledger_net_flow_wld: '0',
      discrepancy_amount_wld: '0',
      last_reconciled_at: '2026-11-01T04:00:00.000Z',
    });
    expect(overview.stats_24h).toEqual({
      injected_wld: '0', absorbed_wld: '0', stock_halt_funded_wld: '0', recirculated_wld: '0',
    });
  });

  it('returns verified zero-funded Treasury with an unavailable reserve ratio when circulation is exactly zero', async () => {
    const { repo } = fixture(certified, '0');
    const overview = await repo.getOverview();
    expect(overview.reconciliation.status).toBe('RECONCILED');
    expect(overview.total_treasury_wld).toBe('0');
    expect(overview.total_circulating_wld).toBe('0');
    expect(overview.reserve_ratio_pct).toBeNull();
  });

  it('accepts exactly the independently attested official Test backup, without relaxing Production requirements', async () => {
    const testProof = {
      ...certified, database_name: 'wdmv_v761_test_acl_v1544_restore',
      historic_treasury_count: '3', historic_dividend_count: '0',
      expected_treasury_count: '3', expected_dividend_count: '0',
      archive_total: '60000000', archive_items_total: '60000000',
      backup_sha256: '2149b77487f83f4e871ff44aa0e1f471b8ada6db9d9e622ce66e6e19ead420d6',
    };
    expect((await fixture(testProof).repo.getOverview()).reconciliation.status).toBe('RECONCILED');
    expect((await fixture({...testProof,database_name:'woldeok_moneyverse_dev'}).repo.getOverview()).reconciliation.status).toBe('UNVERIFIED');
    expect((await fixture({...testProof,backup_sha256:certified.backup_sha256}).repo.getOverview()).reconciliation.status).toBe('UNVERIFIED');
    expect((await fixture({...certified,database_name:'wdmv_v761_test_acl_v1544_restore'}).repo.getOverview()).reconciliation.status).toBe('UNVERIFIED');
    expect((await fixture({...certified,database_name:'unrecognized_db'}).repo.getOverview()).reconciliation.status).toBe('UNVERIFIED');
  });

  it.each([
    ['no epoch', null],
    ['legacy count changed', { ...certified, historic_treasury_count: '551' }],
    ['dividends changed', { ...certified, historic_dividend_count: '743' }],
    ['canonical balance mismatch', { ...certified, canonical_total: '1' }],
    ['unbalanced journal', { ...certified, journal_total: '1' }],
    ['unfunded vault', { ...certified, vault_total: '1' }],
    ['unverified new source', { ...certified, invalid_new_sources: '1' }],
    ['wrong archived backup', { ...certified, backup_sha256: '0'.repeat(64) }],
    ['invalid timestamp', { ...certified, verified_at: 'bad' }],
  ])('fails closed for %s', async (_name, proof) => {
    const { repo } = fixture(proof);
    const overview = await repo.getOverview();
    expect(overview.reconciliation.status).toBe('UNVERIFIED');
    expect(overview.reconciliation.total_ledger_net_flow_wld).toBeNull();
  });

  it.each(['getRevenue', 'getExpenditure'] as const)(
    '%s excludes pre-epoch archived ledger from a current fiscal statement', async (method) => {
      const { repo, query } = fixture();
      await repo[method]();
      const statement = query.mock.calls.map(([sql]) => sql).find((sql) =>
        sql.includes('FROM public.system_treasury_ledger'));
      expect(statement).toContain('created_at >= (SELECT epoch_opened_at FROM public.treasury_fiscal_proof_read())');
      expect(statement).not.toContain('FROM public.treasury_fiscal_epochs');
      // Fiscal epoch remains a private table; app-role reads only a DB-owned scoped function.
    },
  );

  it('never turns a missing proof query into an invented reconciliation', async () => {
    const { repo, query } = fixture();
    query.mockImplementationOnce(async () => ({ rows: [{ total: '0' }] }))
      .mockRejectedValueOnce(new Error('permission denied'));
    const proof = await repo.getReconciliation();
    expect(proof.status).toBe('UNVERIFIED');
  });
});
