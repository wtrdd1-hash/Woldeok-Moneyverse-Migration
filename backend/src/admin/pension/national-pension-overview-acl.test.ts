import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import type { Pool } from 'pg';
import { NationalPensionRepository } from './national-pension.repository';

const summary = {
  total_aum_wld: '9007199254740993123456789',
  total_subscribers_count: '3',
  total_retired_receivers_count: '1',
  total_pension_paid_wld: '9007199254740993',
  vault_main_balance_wld: '10000000',
};

describe('NPS public overview least-privilege boundary', () => {
  it('reads aggregate and certified benchmark rate without raw table access or money mutation', async () => {
    const query = vi.fn().mockImplementation((sql: string) => {
      if (sql.includes('pension_public_overview')) {
        return Promise.resolve({ rows: [summary] });
      }
      if (sql.includes('national_pension_configs')) {
        return Promise.resolve({ rows: [{ benchmark_annual_payout_rate_bps: 800 }] });
      }
      return Promise.resolve({ rows: [] });
    });
    const repository = new NationalPensionRepository({ query } as unknown as Pool);
    const result = await repository.getOverview();
    expect(query).toHaveBeenCalled();
    const sql = String(query.mock.calls[0]?.[0]);
    expect(sql).toMatch(/^SELECT \* FROM public\.pension_public_overview\(\)/i);
    expect(sql).not.toMatch(/FROM\s+public\.(?:national_pension_accounts|system_treasury_vaults)/i);
    expect(result).toEqual({
      totalAumWld: summary.total_aum_wld,
      totalSubscribersCount: 3,
      totalRetiredReceiversCount: 1,
      totalPensionPaidWld: summary.total_pension_paid_wld,
      benchmarkAnnualPayoutRate: '연 8.0% (시간당 0.08%~0.12%)',
      annualPayoutRateCertified: true,
      vaultMainBalanceWld: summary.vault_main_balance_wld,
    });
  });

  it('does not misreport an absent treasury vault as a zero balance', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ ...summary, vault_main_balance_wld: null }] });
    const repository = new NationalPensionRepository({ query } as unknown as Pool);
    await expect(repository.getOverview()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
