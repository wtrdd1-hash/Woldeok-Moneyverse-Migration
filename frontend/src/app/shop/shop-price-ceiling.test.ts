import { describe, expect, it } from 'vitest';
import { normalizeShopPriceCeiling } from './shop-price-ceiling';

describe('shop price ceiling query normalization', () => {
  it('preserves valid exact integer strings without Number coercion', () => {
    expect(normalizeShopPriceCeiling('9007199254740993')).toEqual({
      value: '9007199254740993',
      invalid: false,
    });
    expect(normalizeShopPriceCeiling('9223372036854775807')).toEqual({
      value: '9223372036854775807',
      invalid: false,
    });
    expect(normalizeShopPriceCeiling(undefined)).toEqual({ value: '', invalid: false });
  });
  it.each(['01', '-1', '1.5', '9223372036854775808', 'x', ['1', '2']])(
    'rejects invalid URL value %s',
    (input) => {
      expect(normalizeShopPriceCeiling(input)).toEqual({ value: '', invalid: true });
    },
  );
});
