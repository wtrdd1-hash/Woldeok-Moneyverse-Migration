import { describe, expect, it } from 'vitest';
import {
  formatMarketGap,
  formatMarketTrend,
  formatMarketVolatility,
  formatStockTrend,
  hasUnverifiedMarketEvidence,
} from './market-metrics';
import type { AdminStockDynamics } from '../types';

const stock: AdminStockDynamics = {
  stock_id: '00000000-0000-4000-8000-000000000001',
  symbol: 'TEST',
  name: 'Test Stock',
  current_price: '100',
  fair_value: '80',
  trend_bps: '10.0',
  vol_bps: '300.0',
  market_trend_bps: '-10.0',
  live_events: 0,
};

describe('verified administrator market dynamics', () => {
  it('does not invent zero volatility when the SQL LEFT JOIN has no dynamics row', () => {
    expect(formatMarketVolatility(null)).toBe('—');
    expect(formatStockTrend(null)).toBe('—');
    expect(hasUnverifiedMarketEvidence({ ...stock, vol_bps: null } as unknown as AdminStockDynamics)).toBe(true);
  });

  it('rejects malformed, nonfinite, or negative volatility instead of NaN and fake zero', () => {
    for (const value of ['', ' ', 'NaN', 'Infinity', '-1.0', '1e9', '1,000', 0, {}, '100000000000000000000']) {
      expect(formatMarketVolatility(value)).toBe('—');
    }
    expect(formatMarketVolatility('300.0')).toBe('3.0 %/일');
    expect(formatMarketVolatility('0.0')).toBe('0.0 %/일');
    expect(formatStockTrend('-123.4')).toBe('-1.2 %/일');
    expect(formatStockTrend('123.4')).toBe('+1.2 %/일');
  });

  it('does not use the first stock as proof of a contradictory or absent market regime', () => {
    expect(formatMarketTrend(null)).toBe('—');
    expect(formatMarketTrend([])).toBe('—');
    expect(formatMarketTrend([{ market_trend_bps: null }])).toBe('—');
    expect(formatMarketTrend([stock, { ...stock, market_trend_bps: '15.0' }])).toBe('—');
    expect(formatMarketTrend([stock, { ...stock, market_trend_bps: '-10.00' }])).toBe('-0.1 %/일');
  });

  it('keeps huge integer price ratios from becoming Infinity or rounded evidence', () => {
    expect(formatMarketGap('100', '80')).toBe('+25.0 %');
    expect(formatMarketGap('10', '20')).toBe('-50.0 %');
    expect(formatMarketGap('100', '0')).toBe('—');
    expect(formatMarketGap('9'.repeat(120), '1')).toBe('—');
    expect(formatMarketGap(null, '1')).toBe('—');
  });

  it('flags absent/contradictory evidence without hiding valid rows', () => {
    expect(hasUnverifiedMarketEvidence(stock)).toBe(false);
    expect(hasUnverifiedMarketEvidence({ ...stock, fair_value: null } as unknown as AdminStockDynamics)).toBe(true);
    expect(hasUnverifiedMarketEvidence({ ...stock, market_trend_bps: null } as unknown as AdminStockDynamics)).toBe(true);
    expect(hasUnverifiedMarketEvidence({ ...stock, live_events: -1 })).toBe(true);
  });
});
