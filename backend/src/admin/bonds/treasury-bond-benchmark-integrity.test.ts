import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { bondBenchmarkYield, TreasuryBondRepository } from './treasury-bond.repository';

describe('virtual treasury bond benchmarks', () => {
  it('does not synthesize rates for absent or closed bond symbols', () => {
    expect(bondBenchmarkYield([], 'KTB-01Y')).toBe('—');
    expect(bondBenchmarkYield([{ symbol: 'KTB-01Y', status: 'FROZEN', annual_coupon_rate_bps: 450 }], 'KTB-01Y')).toBe('—');
  });
  it('publishes no synthetic missing yields in the actual repository overview', async () => {
    const pool = { query: vi.fn().mockResolvedValue({ rows: [{ count: '1', total_funded: '10000', total: '0' }] }) };
    const repository = new TreasuryBondRepository(pool as unknown as Pool);
    vi.spyOn(repository, 'listBonds').mockResolvedValue([{ symbol: 'KTB-01Y', status: 'OPEN_SUBSCRIPTION', annual_coupon_rate_bps: 475 }] as never);
    const overview = await repository.getOverview();
    expect(overview.benchmark1YYield).toBe('4.75%');
    expect(overview.benchmark3YYield).toBe('—');
    expect(overview.benchmark5YYield).toBe('—');
    expect(pool.query).toHaveBeenCalledTimes(4);
  });
  it('uses the current listed rate only for open or trading virtual bonds', () => {
    expect(bondBenchmarkYield([{ symbol: 'KTB-01Y', status: 'OPEN_SUBSCRIPTION', annual_coupon_rate_bps: 475 }], 'KTB-01Y')).toBe('4.75%');
    expect(bondBenchmarkYield([{ symbol: 'KTB-03Y', status: 'TRADING', annual_coupon_rate_bps: 500 }], 'KTB-03Y')).toBe('5.00%');
  });
});
