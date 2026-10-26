import { describe, expect, it } from 'vitest';
import { parseAdminBondTelemetry } from './bond-telemetry';

import { validTelemetry } from './bond-telemetry.fixture';

describe('admin bond telemetry contract', () => {
  it('accepts verified server data and preserves WLD integer precision', () => {
    expect(parseAdminBondTelemetry(validTelemetry)?.overview.totalFundedWld).toBe(
      '9007199254740993',
    );
  });
  it('accepts genuinely empty lists and zero-valued overview', () => {
    const data = {
      ...validTelemetry,
      overview: {
        ...validTelemetry.overview,
        totalBondsActive: 0,
        totalFundedWld: '0',
        totalHoldersCount: 0,
      },
      bonds: [],
      couponLogs: [],
    };
    expect(parseAdminBondTelemetry(data)?.bonds).toEqual([]);
  });
  it('rejects missing and fabricated overview instead of treating it as zero', () => {
    expect(parseAdminBondTelemetry({ ...validTelemetry, overview: null })).toBeNull();
    expect(
      parseAdminBondTelemetry({ ...validTelemetry, overview: { totalBondsActive: 3 } }),
    ).toBeNull();
  });
  it('rejects negative, fractional and unsafe counts or WLD amounts', () => {
    for (const bad of ['-1', '1.5', '1e9', 'NaN']) {
      expect(
        parseAdminBondTelemetry({
          ...validTelemetry,
          overview: { ...validTelemetry.overview, totalFundedWld: bad },
        }),
      ).toBeNull();
    }
    expect(
      parseAdminBondTelemetry({
        ...validTelemetry,
        overview: { ...validTelemetry.overview, totalHoldersCount: Number.MAX_SAFE_INTEGER + 1 },
      }),
    ).toBeNull();
  });
  it('rejects malformed bonds and coupon logs without rendering a partial success', () => {
    expect(parseAdminBondTelemetry({ ...validTelemetry, bonds: [{ id: 'bad' }] })).toBeNull();
    expect(
      parseAdminBondTelemetry({ ...validTelemetry, couponLogs: [{ amount_wld: 'oops' }] }),
    ).toBeNull();
  });
  it('rejects fake benchmarks and unparseable timestamps', () => {
    expect(
      parseAdminBondTelemetry({
        ...validTelemetry,
        overview: { ...validTelemetry.overview, benchmark1YYield: 'AAA' },
      }),
    ).toBeNull();
    expect(
      parseAdminBondTelemetry({
        ...validTelemetry,
        couponLogs: [{ ...validTelemetry.couponLogs[0], created_at: 'yesterday' }],
      }),
    ).toBeNull();
  });
});
