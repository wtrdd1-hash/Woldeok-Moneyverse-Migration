import { describe, expect, it } from 'vitest';
import { verifyBondMarkets } from './market-integrity';

const id = 'c69c4696-2f6c-43f8-ae1e-58bbcd77a1d8';
const bond = {
  id, symbol: 'KTB-01Y', name: '게임 내 1년 채권', maturity_hours: 8760,
  annual_coupon_rate_bps: 450, hourly_coupon_rate_bps: 5,
  par_value_wld: '10000', total_issued_units: '100', available_units: '90',
  total_funded_wld: '100000', status: 'OPEN_SUBSCRIPTION', description: '',
};
const now = Date.parse('2026-10-26T09:50:00.000Z');
const market = {
  disclosed_at: '2026-10-26T09:49:30.000Z',
  overview: { totalBondsActive: 1, totalFundedWld: '100000', totalHoldersCount: 1,
    totalCouponsPaidWld: '0', benchmark1YYield: '4.50%',
    benchmark3YYield: '5.20%', benchmark5YYield: '6.50%' },
  bonds: [bond], guarantor: 'AAA Sovereign',
};

describe('verified virtual bond market', () => {
  it('uses real API bond rates and never invents absent 3Y/5Y benchmarks', () => {
    const result = verifyBondMarkets(market, now);
    expect(result?.overview.benchmark1YYield).toBe('4.50%');
    expect(result?.overview.benchmark3YYield).toBe('—');
    expect(result?.overview.benchmark5YYield).toBe('—');
    expect(result?.bonds).toHaveLength(1);
  });
  it('rejects unavailable, malformed, and stale snapshots instead of claiming an empty market', () => {
    expect(verifyBondMarkets(null, now)).toBeNull();
    expect(verifyBondMarkets({ ...market, bonds: null }, now)).toBeNull();
    expect(verifyBondMarkets({ ...market, disclosed_at: '2026-10-26T08:00:00.000Z' }, now)).toBeNull();
    expect(verifyBondMarkets({ ...market, disclosed_at: '2030-01-01T00:00:00Z' }, now)).toBeNull();
  });
  it('rejects invalid financial integers and oversized/negative available units', () => {
    expect(verifyBondMarkets({ ...market, bonds: [{ ...bond, available_units: '9007199254740994.5' }] }, now)).toBeNull();
    expect(verifyBondMarkets({ ...market, bonds: [{ ...bond, available_units: '101' }] }, now)).toBeNull();
    expect(verifyBondMarkets({ ...market, overview: { ...market.overview, totalFundedWld: '-100' } }, now)).toBeNull();
  });
  it('rejects duplicate identifiers and non-numeric rates to prevent render-time crashes', () => {
    expect(verifyBondMarkets({ ...market, bonds: [bond, bond] }, now)).toBeNull();
    expect(verifyBondMarkets({ ...market, bonds: [{ ...bond, annual_coupon_rate_bps: '450' }] }, now)).toBeNull();
  });
  it('accepts genuine empty results but never supplies fallback interest rates', () => {
    const result = verifyBondMarkets({ ...market, bonds: [], overview: { ...market.overview, totalBondsActive: 0 } }, now);
    expect(result?.bonds).toEqual([]);
    expect(result?.overview.benchmark1YYield).toBe('—');
  });
});
