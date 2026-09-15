import { describe, expect, it } from 'vitest';
import { filterStocks, normalizeStockQuery } from './stock-search';

const stocks = [
  { symbol: 'WDX', name: '월덕 지수', description: '커뮤니티 대표 종목' },
  { symbol: 'MOON', name: 'Moon Labs', description: 'Virtual technology company' },
];

describe('stock search', () => {
  it('matches symbol, name, and description without case sensitivity', () => {
    expect(filterStocks(stocks, 'moon', 'en')).toEqual([stocks[1]]);
    expect(filterStocks(stocks, '월덕', 'ko')).toEqual([stocks[0]]);
    expect(filterStocks(stocks, 'technology', 'en')).toEqual([stocks[1]]);
  });

  it('normalizes repeated URL parameters and caps query length', () => {
    expect(normalizeStockQuery(['  WDX  ', 'ignored'])).toBe('WDX');
    expect(normalizeStockQuery('x'.repeat(100))).toHaveLength(80);
    expect(normalizeStockQuery(undefined)).toBe('');
  });
});
