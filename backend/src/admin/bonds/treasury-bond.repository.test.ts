import { ServiceUnavailableException } from '@nestjs/common';
import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { TreasuryBondRepository } from './treasury-bond.repository';

describe('TreasuryBondRepository subscription ledger containment', () => {
  it.each([1, 5, 0, -1, 1.5, Number.NaN])('refuses %s units before any DB connection', async (units) => {
    const connect = vi.fn();
    const repository = new TreasuryBondRepository({ connect } as unknown as Pool);
    await expect(repository.subscribeBond('member-1', 'bond-1', units))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(connect).not.toHaveBeenCalled();
  });
});


describe('TreasuryBondRepository coupon-interest overview accounting', () => {
  it('excludes maturity principal repayments from cumulative coupon interest', async () => {
    const query = vi.fn(async (statement: string) => {
      if (statement.includes('bond_public_read_totals')) {
        return { rows: [{ holders_count: '0', coupons_paid_wld: '42', repo_active_principal_wld: '0' }] };
      }
      if (statement.includes('COUNT(*)::text')) return { rows: [{ count: '0', total_funded: '0' }] };
      if (statement.includes('COUNT(DISTINCT')) return { rows: [{ count: '0' }] };
      if (statement.includes('SUM(principal_wld)')) return { rows: [{ total: '0' }] };
      return { rows: [] };
    });
    const repository = new TreasuryBondRepository({ query } as unknown as Pool);
    const overview = await repository.getOverview();
    expect(overview.totalCouponsPaidWld).toBe('42');
    expect(query.mock.calls.some(([sql]) => sql.includes('bond_public_read_totals'))).toBe(true);
  });
});
