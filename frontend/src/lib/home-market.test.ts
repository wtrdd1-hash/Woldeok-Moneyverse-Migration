import { describe, expect, it } from 'vitest';
import { selectTopMovers } from './home-market';

describe('home live-market quote selection', () => {
  it('does not fabricate prices or securities when the upstream stock feed is unavailable', () => {
    expect(selectTopMovers(null)).toEqual([]);
    expect(selectTopMovers([])).toEqual([]);
  });

  it('excludes invalid or unsafe quote values instead of turning failed parses into real prices', () => {
    expect(
      selectTopMovers([
        { symbol: 'BAD', name: 'Invalid', current_price: 'unknown', day_open_price: '100' },
        { symbol: 'ZERO', name: 'No open', current_price: '100', day_open_price: '0' },
        { symbol: 'HUGE', name: 'Unsafe integer', current_price: '9007199254740993', day_open_price: '10' },
      ]),
    ).toEqual([]);
  });

  it('ranks only actual valid quotes by absolute change without mutating the input', () => {
    const quotes = [
      { symbol: 'A', name: 'A', current_price: '110', day_open_price: '100' },
      { symbol: 'B', name: 'B', current_price: '80', day_open_price: '100' },
      { symbol: 'C', name: 'C', current_price: '101', day_open_price: '100' },
    ];
    expect(selectTopMovers(quotes).map((x) => [x.symbol, x.pct])).toEqual([
      ['B', -20],
      ['A', 10],
      ['C', 1],
    ]);
    expect(quotes[0]?.symbol).toBe('A');
  });
});
