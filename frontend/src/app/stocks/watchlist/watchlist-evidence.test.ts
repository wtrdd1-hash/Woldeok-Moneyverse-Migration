import { describe, expect, it } from 'vitest';
import { changeLabel, normalizeWatchlistQuery, parseWatchlistResponse, sortWatchlist } from './watchlist-evidence';

const a = {
  stock_id: '0f99eae8-7b61-4f40-90aa-c6a0a5bfe120', symbol: 'AAA', name: 'Alpha',
  current_price: '1000000000000000001', day_open_price: '1000000000000000000',
  created_at: '2026-10-31T10:00:00.000Z',
};
const b = {
  stock_id: '1f99eae8-7b61-4f40-90aa-c6a0a5bfe120', symbol: 'BBB', name: 'Beta',
  current_price: '1000000000000000002', day_open_price: '1000000000000000000',
  created_at: '2026-10-31T11:00:00.000Z',
};

describe('member watchlist source integrity', () => {
  it('distinguishes a verified empty list from invalid source payloads', () => {
    expect(parseWatchlistResponse({ stocks: [] })).toEqual({ stocks: [] });
    expect(parseWatchlistResponse(null)).toBeNull();
    expect(parseWatchlistResponse({ stocks: 'empty' })).toBeNull();
    expect(parseWatchlistResponse({ stocks: [{ ...a, current_price: 'NaN' }] })).toBeNull();
    expect(parseWatchlistResponse({ stocks: [{ ...a, day_open_price: '-1' }] })).toBeNull();
    expect(parseWatchlistResponse({ stocks: [{ ...a, stock_id: 'bad' }] })).toBeNull();
    expect(parseWatchlistResponse({ stocks: [{ ...a, created_at: 'invalid' }] })).toBeNull();
    expect(parseWatchlistResponse({ stocks: [a, { ...b, stock_id: a.stock_id }] })).toBeNull();
    expect(parseWatchlistResponse({ stocks: [a, { ...b, symbol: a.symbol }] })).toBeNull();
  });

  it('accepts real PostgreSQL integer strings without lossy Number conversion', () => {
    expect(parseWatchlistResponse({ stocks: [a, b] })).toEqual({ stocks: [a, b] });
  });

  it('sorts fractional basis-point moves exactly, without truncation ties', () => {
    const rows = parseWatchlistResponse({ stocks: [a, b] })!.stocks;
    expect(sortWatchlist(rows, 'change').map((stock) => stock.symbol)).toEqual(['BBB', 'AAA']);
    expect(rows.map((stock) => stock.symbol)).toEqual(['AAA', 'BBB']);
  });

  it('bounds malformed and repeated search parameters', () => {
    expect(normalizeWatchlistQuery([' AAA ', 'ignored'])).toBe('AAA');
    expect(normalizeWatchlistQuery('a'.repeat(100))).toHaveLength(80);
    expect(normalizeWatchlistQuery(undefined)).toBe('');
  });

  it('does not mistake a zero day-open price for a verified zero-percent move', () => {
    const rows = parseWatchlistResponse({ stocks: [{ ...a, day_open_price: '0' }, b] })!.stocks;
    expect(sortWatchlist(rows, 'change').map((stock) => stock.symbol)).toEqual(['BBB', 'AAA']);
    expect(changeLabel('5', '0')).toBe('—');
    expect(changeLabel('1000000000000000001', '1000000000000000000')).toBe('+<0.01%');
  });
});
