import { describe, expect, it } from 'vitest';
import { parseComparisonMarket } from './stock-comparison-source';

const first = {
  id: '123e4567-e89b-42d3-a456-426614174000',
  symbol: 'AAA',
  name: 'Alpha',
  current_price: '9007199254740993',
  day_open_price: '9007199254740992',
  day_high_price: '9007199254740994',
  day_low_price: '9007199254740990',
  shares_available: '0',
};
const second = {
  ...first,
  id: '123e4567-e89b-42d3-a456-426614174001',
  symbol: 'BBB',
  name: 'Beta',
  current_price: '100',
  day_open_price: '0',
  day_high_price: '100',
  day_low_price: '0',
};

describe('parseComparisonMarket', () => {
  it('accepts authoritative integer strings without Number rounding, including a zero opening price', () => {
    expect(parseComparisonMarket({ stocks: [first, second] })).toEqual([first, second]);
  });

  it('preserves a verified empty market distinct from an unavailable response', () => {
    expect(parseComparisonMarket({ stocks: [] })).toEqual([]);
    expect(parseComparisonMarket(null)).toBeNull();
    expect(parseComparisonMarket({})).toBeNull();
    expect(parseComparisonMarket({ stocks: null })).toBeNull();
  });

  it.each([
    { ...first, current_price: '-1' },
    { ...first, current_price: '1.5' },
    { ...first, current_price: '9,999' },
    { ...first, current_price: 123 },
    { ...first, current_price: '9223372036854775808' },
    { ...first, day_low_price: '9007199254740995' },
    { ...first, shares_available: '-1' },
    { ...first, id: 'not-a-uuid' },
    { ...first, symbol: '  ' },
    { ...first, name: '' },
    { ...first, day_high_price: undefined },
  ])('rejects malformed market evidence without returning a partial list (%j)', (bad) => {
    expect(parseComparisonMarket({ stocks: [first, bad] })).toBeNull();
  });

  it('rejects duplicate identities and symbols (case-insensitive) to avoid ambiguous comparison selections', () => {
    expect(parseComparisonMarket({ stocks: [first, { ...second, id: first.id }] })).toBeNull();
    expect(parseComparisonMarket({ stocks: [first, { ...second, symbol: 'aaa' }] })).toBeNull();
  });

  it('rejects a non-object row and an unbounded source response', () => {
    expect(parseComparisonMarket({ stocks: [first, null] })).toBeNull();
    expect(parseComparisonMarket({ stocks: Array.from({ length: 1001 }, () => first) })).toBeNull();
  });
});
