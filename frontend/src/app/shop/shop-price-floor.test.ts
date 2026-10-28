import { describe, expect, it } from 'vitest';
import { shopMinimumPriceQuery } from './shop-price-floor';

describe('shop minimum price web form', () => {
  it('keeps the search term and exact integer string', () => {
    expect(shopMinimumPriceQuery('사과', '9007199254740993')).toEqual({
      valid: true, query: '?q=%EC%82%AC%EA%B3%BC&minPrice=9007199254740993',
    });
  });
  it('does not silently coerce an invalid price to zero or hide the catalogue', () => {
    expect(shopMinimumPriceQuery('test', '-1')).toEqual({ valid: false, query: '' });
    expect(shopMinimumPriceQuery('', '9223372036854775808')).toEqual({ valid: false, query: '' });
    expect(shopMinimumPriceQuery('', '')).toEqual({ valid: true, query: '' });
  });
});
