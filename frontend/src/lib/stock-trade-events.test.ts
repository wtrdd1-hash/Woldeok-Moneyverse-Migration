import { describe, expect, it } from 'vitest';
import { parseStockTradeEvent } from './use-market-prices';

const valid = {
  id: 'trade-db-1', stockId: 'stock-1', price: '15000', quantity: 7,
  side: 'BUY', timestamp: '2026-10-25T03:47:00.000Z',
};

describe('server execution event boundary', () => {
  it('accepts an authenticated backend-shaped execution event', () => {
    expect(parseStockTradeEvent(valid)).toEqual(valid);
  });
  it.each([
    { ...valid, id: '' },
    { ...valid, stockId: '' },
    { ...valid, price: 'NaN' },
    { ...valid, price: '0' },
    { ...valid, quantity: 0 },
    { ...valid, quantity: 2.5 },
    { ...valid, side: 'UNKNOWN' },
    { ...valid, timestamp: 'not-a-date' },
  ])('rejects malformed or invented executions: %j', (payload) => {
    expect(parseStockTradeEvent(payload)).toBeNull();
  });
});
