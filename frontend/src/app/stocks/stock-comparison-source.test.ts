import { describe, expect, it } from 'vitest';
import { parseComparableStocksResponse } from './stock-comparison-source';

const a = {
  id: '11111111-1111-4111-8111-111111111111',
  symbol: 'AAA', name: 'Alpha', current_price: '90071992547409931234567890',
  day_open_price: '90071992547409931234567889', day_high_price: '90071992547409931234567890',
  day_low_price: '90071992547409931234567880', shares_available: '0',
};
const b = { ...a, id: '22222222-2222-4222-8222-222222222222', symbol: 'BBB', name: 'Beta' };

describe('verified stock comparison API boundary', () => {
  it('preserves exact WLD integer strings from the real market response', () => {
    expect(parseComparableStocksResponse({ stocks: [a, b] })).toEqual([a, b]);
  });

  it('distinguishes a verified empty market from unavailable data', () => {
    expect(parseComparableStocksResponse({ stocks: [] })).toEqual([]);
    expect(parseComparableStocksResponse(null)).toBeNull();
    expect(parseComparableStocksResponse({ stocks: null })).toBeNull();
    expect(parseComparableStocksResponse({ stocks: {} })).toBeNull();
    expect(parseComparableStocksResponse({ stocks: [null] })).toBeNull();
  });

  it('rejects missing, unsafe, fractional and negative price fields', () => {
    for (const current_price of [undefined, null, 1.5, 9007199254740992, '-1', 'NaN', '1.0', '']) {
      expect(parseComparableStocksResponse({ stocks: [{ ...a, current_price }] })).toBeNull();
    }
  });

  it('rejects contradictory daily high/low and negative share supply', () => {
    expect(parseComparableStocksResponse({ stocks: [{ ...a, day_low_price: '50', day_high_price: '40' }] })).toBeNull();
    expect(parseComparableStocksResponse({ stocks: [{ ...a, shares_available: '-5' }] })).toBeNull();
  });

  it('rejects invalid identifiers, empty labels and duplicated identities', () => {
    expect(parseComparableStocksResponse({ stocks: [{ ...a, id: 'not-a-uuid' }] })).toBeNull();
    expect(parseComparableStocksResponse({ stocks: [{ ...a, name: ' ' }] })).toBeNull();
    expect(parseComparableStocksResponse({ stocks: [a, { ...b, id: a.id }] })).toBeNull();
    expect(parseComparableStocksResponse({ stocks: [a, { ...b, symbol: 'aaa' }] })).toBeNull();
  });

  it('rejects unbounded response arrays instead of rendering arbitrary payloads', () => {
    expect(parseComparableStocksResponse({ stocks: Array(201).fill(a) })).toBeNull();
  });
});
