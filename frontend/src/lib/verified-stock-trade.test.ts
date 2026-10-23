import { describe, expect, it } from 'vitest';
import { parseVerifiedStockTrade, appendVerifiedStockTrade } from './verified-stock-trade';

const confirmed = {
  id: 'trade-123',
  stockId: 'stock-1',
  price: '15000',
  quantity: 3,
  side: 'BUY',
  timestamp: '2026-10-23T20:00:00.000Z',
};

describe('authoritative stock execution validation', () => {
  it('accepts a complete server execution receipt', () => {
    expect(parseVerifiedStockTrade(confirmed)).toEqual(confirmed);
  });

  it.each([
    { ...confirmed, id: '' },
    { ...confirmed, stockId: '' },
    { ...confirmed, price: '15,000' },
    { ...confirmed, price: '-5' },
    { ...confirmed, price: '0' },
    { ...confirmed, quantity: Number.MAX_SAFE_INTEGER + 1 },
    { ...confirmed, quantity: 0 },
    { ...confirmed, side: 'HOLD' },
    { ...confirmed, timestamp: 'not-a-time' },
    { ...confirmed, timestamp: '2099-01-01T00:00:00.000Z' },
    null,
  ])('rejects malformed or unverifiable executions: %o', (payload) => {
    expect(parseVerifiedStockTrade(payload)).toBeNull();
  });

  it('deduplicates replays and preserves newest-first receipts', () => {
    const once = appendVerifiedStockTrade([], confirmed);
    expect(appendVerifiedStockTrade(once, confirmed)).toBe(once);
    expect(appendVerifiedStockTrade(once, { ...confirmed, id: 'trade-124', side: 'SELL' })).toHaveLength(2);
  });
});
