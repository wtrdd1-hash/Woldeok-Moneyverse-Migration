import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { TreasuryBondRepository } from './treasury-bond.repository';

describe('treasury bond owner read ACL', () => {
  it('reads holdings and repo loans through actor-scoped functions, never raw member tables', async () => {
    const query = vi.fn(async (_sql: string, _args?: unknown[]) => ({ rows: [] }));
    const repo = new TreasuryBondRepository({ query } as unknown as Pool);
    const actor = '11111111-1111-4111-8111-111111111111';
    await repo.listUserHoldings(actor);
    await repo.listUserRepoLoans(actor);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toMatch(/public\.bond_owner_holdings\(\$1::uuid\)/);
    expect(query.mock.calls[1][0]).toMatch(/public\.bond_owner_repo_loans\(\$1::uuid\)/);
    expect(query.mock.calls.map(([sql]) => sql).join(' ')).not.toMatch(/FROM public\.treasury_bond_holdings|JOIN public\.treasury_bond_holdings|FROM public\.treasury_bond_repo_loans/);
    expect(query.mock.calls[0][1]).toEqual([actor]);
    expect(query.mock.calls[1][1]).toEqual([actor]);
  });

  it('obtains public aggregate metrics without direct private holding reads', async () => {
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('bond_public_read_totals')) return { rows: [{ holders_count: '2', coupons_paid_wld: '123', repo_active_principal_wld: '45' }] };
      if (sql.includes('COUNT(*)::text')) return { rows: [{ count: '1', total_funded: '1000' }] };
      return { rows: [] };
    });
    const repo = new TreasuryBondRepository({ query } as unknown as Pool);
    const overview = await repo.getOverview();
    expect(overview.totalHoldersCount).toBe(2);
    expect(overview.totalCouponsPaidWld).toBe('123');
    expect(overview.totalRepoLoansWld).toBe('45');
    expect(query.mock.calls.map(([sql]) => sql).join(' ')).not.toMatch(/FROM public\.treasury_bond_holdings|FROM public\.treasury_bond_repo_loans|FROM public\.treasury_bond_coupon_logs|FROM public\.treasury_bonds/);
  });
  it('fails closed when public bond aggregate evidence is missing', async () => {
    const query = vi.fn(async (sql: string) => sql.includes('bond_public_read_totals')
      ? { rows: [] }
      : { rows: [{ count: '1', total_funded: '10' }] });
    const repo = new TreasuryBondRepository({ query } as unknown as Pool);
    await expect(repo.getOverview()).rejects.toMatchObject({ status: 503 });
  });

});
