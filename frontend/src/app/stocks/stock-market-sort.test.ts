import { describe, expect, it } from 'vitest';
import { normalizeStockSort, sortMarketStocks } from './stock-market-sort';

const rows = [
  {
    id: '1',
    symbol: 'AAA',
    name: 'Alpha',
    current_price: '1000000000000000000000000000001',
    day_open_price: '1000000000000000000000000000000',
    shares_available: '2',
  },
  {
    id: '2',
    symbol: 'BBB',
    name: 'Beta',
    current_price: '300',
    day_open_price: '200',
    shares_available: '9000000000000000000000000000000',
  },
  {
    id: '3',
    symbol: 'CCC',
    name: 'Gamma',
    current_price: '90',
    day_open_price: '100',
    shares_available: '5',
  },
];

describe('stock market sorting', () => {
  it('normalizes only supported URL sort values', () => {
    expect(normalizeStockSort('change')).toBe('change');
    expect(normalizeStockSort('garbage')).toBe('default');
    expect(normalizeStockSort(undefined)).toBe('default');
  });

  it('sorts integer-string values without Number precision loss', () => {
    expect(sortMarketStocks(rows, 'price').map((row) => row.symbol)).toEqual(['AAA', 'BBB', 'CCC']);
    expect(sortMarketStocks(rows, 'available').map((row) => row.symbol)).toEqual([
      'BBB',
      'CCC',
      'AAA',
    ]);
  });

  it('sorts percentage movers by exact cross multiplication', () => {
    expect(sortMarketStocks(rows, 'change').map((row) => row.symbol)).toEqual([
      'BBB',
      'AAA',
      'CCC',
    ]);
  });

  it('does not mutate API order when sorting', () => {
    const result = sortMarketStocks(rows, 'name');
    expect(result).not.toBe(rows);
    expect(rows.map((row) => row.symbol)).toEqual(['AAA', 'BBB', 'CCC']);
  });
});
