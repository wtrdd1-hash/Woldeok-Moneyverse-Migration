import { describe, expect, it } from 'vitest';
import { parseVerifiedStockTrade } from './use-market-prices';

const now = Date.parse('2026-11-02T00:00:00.000Z');
const valid = { id: 'receipt-1', stockId: 'stock-1', price: '15000', quantity: 7, side: 'BUY', timestamp: new Date(now).toISOString() };

describe('server trade feed validation', () => {
  it('accepts the authenticated server trade broadcast shape', () => {
    expect(parseVerifiedStockTrade(valid, now)).toEqual(valid);
  });
  it.each([
    null, {}, { ...valid, price: '1e9' }, { ...valid, price: '-1' },
    { ...valid, price: '0' }, { ...valid, quantity: 0 },
    { ...valid, quantity: 1.5 }, { ...valid, quantity: Infinity },
    { ...valid, side: 'buy' }, { ...valid, stockId: '' },
    { ...valid, timestamp: 'not-a-date' },
    { ...valid, timestamp: new Date(now - 121_000).toISOString() },
    { ...valid, timestamp: new Date(now + 31_000).toISOString() },
    { ...valid, id: 'x'.repeat(130) },
  ])('rejects invalid or stale execution events (%j)', (value) => {
    expect(parseVerifiedStockTrade(value, now)).toBeNull();
  });
});
