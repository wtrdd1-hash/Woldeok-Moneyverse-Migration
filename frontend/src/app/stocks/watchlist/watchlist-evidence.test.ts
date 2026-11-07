import { describe, expect, it } from 'vitest';
import { parseVerifiedStockWatchlist } from './watchlist-evidence';
const row = { stock_id: '11111111-1111-4111-8111-111111111111', symbol: 'MV', name: 'Moneyverse', current_price: '9007199254740993123', day_open_price: '100', created_at: '2026-11-01T10:30:00.000Z' };
describe('member watchlist source', () => {
  it('preserves verified empty results and exact prices', () => {
    expect(parseVerifiedStockWatchlist({ stocks: [] })).toEqual([]);
    expect(parseVerifiedStockWatchlist({ stocks: [row] })).toEqual([row]);
  });
  it.each([null, {}, { stocks: null }, { stocks: 'none' }, { stocks: [{ ...row, current_price: '1e9' }] }, { stocks: [{ ...row, day_open_price: '0' }] }, { stocks: [{ ...row, current_price: -100 }] }, { stocks: [{ ...row, symbol: 'INVALID_SYMBOL' }] }, { stocks: [{ ...row, stock_id: 'bad' }] }, { stocks: [{ ...row, name: '' }] }, { stocks: [{ ...row, created_at: 'bad' }] }, { stocks: [row, row] }, { stocks: [row, { ...row, stock_id: '22222222-2222-4222-8222-222222222222' }] }])('rejects invalid source %#', (value) => {
    expect(parseVerifiedStockWatchlist(value)).toBeNull();
  });
});
