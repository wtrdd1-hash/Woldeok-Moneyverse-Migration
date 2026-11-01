import { describe, expect, it } from 'vitest';
import { verifiedComparisonMarket } from './verified-market';

const first = {
  id: '11111111-1111-4111-8111-111111111111', symbol: 'AA', name: 'Alpha',
  current_price: '9007199254740993', day_open_price: '9007199254740991',
  day_high_price: '9007199254741000', day_low_price: '9007199254740990',
  shares_outstanding: '1000000', shares_available: '100',
};
const second = {
  ...first, id: '22222222-2222-4222-8222-222222222222', symbol: 'BB', name: 'Beta',
};

const market = (stocks: unknown) => ({ stocks });

describe('verifiedComparisonMarket', () => {
  it('accepts the real stock_market_overview contract without rounding large prices', () => {
    expect(verifiedComparisonMarket(market([first, second]))).toEqual([first, second]);
  });

  it('preserves a verified empty market but refuses absent or malformed source envelopes', () => {
    expect(verifiedComparisonMarket(market([]))).toEqual([]);
    for (const payload of [null, undefined, {}, { stocks: null }, market('[]'), market({}), market([null])]) {
      expect(verifiedComparisonMarket(payload)).toBeNull();
    }
  });

  it('refuses malformed or unsafe integer prices instead of passing them to BigInt', () => {
    for (const value of [undefined, null, 100, 1.5, '-10', '0', '01', '1.0', ' 10', 'NaN', '9223372036854775808']) {
      expect(verifiedComparisonMarket(market([{ ...first, current_price: value }]))).toBeNull();
    }
  });

  it('rejects contradictory day ranges and share availability', () => {
    for (const row of [
      { ...first, day_high_price: '10', day_low_price: '20' },
      { ...first, shares_available: '1000001' },
      { ...first, shares_available: '-1' },
      { ...first, shares_outstanding: '0' },
    ]) expect(verifiedComparisonMarket(market([row]))).toBeNull();
  });

  it('rejects duplicates, invalid identities and invalid names', () => {
    for (const stocks of [
      [first, first], [first, { ...second, symbol: 'AA' }],
      [{ ...first, id: 'not-a-uuid' }], [{ ...first, symbol: 'a<script>' }],
      [{ ...first, name: '' }], [{ ...first, name: 'x'.repeat(81) }],
    ]) expect(verifiedComparisonMarket(market(stocks))).toBeNull();
  });

  it('rejects unbounded market payloads instead of rendering thousands of checkboxes', () => {
    expect(verifiedComparisonMarket(market(Array.from({ length: 501 }, (_, i) => ({ ...first, symbol: `A${i}` }))))).toBeNull();
  });
});
