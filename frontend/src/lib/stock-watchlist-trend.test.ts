import { describe, expect, it } from 'vitest';
import { parseStockWatchlistTrend, parseVerifiedStockWatchlist } from './stock-watchlist-trend';

const stock = (price: string, open: string) => ({
  stock_id: '00000000-0000-4000-8000-000000000012', symbol: 'WLD', name: 'WLD',
  current_price: price, day_open_price: open, created_at: '2026-10-30T00:00:00.000Z',
});

describe('owner stock watchlist response proof', () => {
  it('rejects ambiguous trend queries', () => {
    expect(parseStockWatchlistTrend(undefined)).toBe('all');
    expect(parseStockWatchlistTrend('up')).toBe('up');
    expect(parseStockWatchlistTrend(['up', 'down'])).toBeNull();
    expect(parseStockWatchlistTrend('UP')).toBeNull();
  });
  it('accepts exact integer-string up/down/flat evidence and no zero-open flat', () => {
    expect(parseVerifiedStockWatchlist({ stocks: [stock('9007199254740993', '9007199254740992')] }, 'up')).not.toBeNull();
    expect(parseVerifiedStockWatchlist({ stocks: [stock('4', '5')] }, 'down')).not.toBeNull();
    expect(parseVerifiedStockWatchlist({ stocks: [stock('5', '5')] }, 'flat')).not.toBeNull();
    expect(parseVerifiedStockWatchlist({ stocks: [stock('5', '0')] }, 'flat')).toBeNull();
  });
  it('fails closed on malformed, mismatched and duplicate owner evidence', () => {
    expect(parseVerifiedStockWatchlist({ stocks: [stock('10', '9')] }, 'down')).toBeNull();
    expect(parseVerifiedStockWatchlist({ stocks: [stock('1e2', '9')] }, 'all')).toBeNull();
    expect(parseVerifiedStockWatchlist({ stocks: [stock('10', '9'), stock('10', '9')] }, 'all')).toBeNull();
    expect(parseVerifiedStockWatchlist({ stocks: [{ ...stock('10', '9'), stock_id: 'abcdefab-0000-4000-8000-000000000012' }, { ...stock('10', '9'), stock_id: 'ABCDEFAB-0000-4000-8000-000000000012' }] }, 'all')).toBeNull();
    expect(parseVerifiedStockWatchlist({ stocks: [{ ...stock('10', '9'), created_at: '2026-10-30' }] }, 'all')).toBeNull();
    expect(parseVerifiedStockWatchlist({ stocks: 'not-array' }, 'all')).toBeNull();
    expect(parseVerifiedStockWatchlist({ stocks: [] }, 'up')).toEqual({ stocks: [] });
  });
});
