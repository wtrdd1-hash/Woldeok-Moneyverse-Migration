import { describe, expect, it } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { filterShopMinimumPrice, parseShopMinimumPrice } from './shop-price-floor';

describe('shop minimum price query', () => {
  it('accepts an omitted value, zero, and an exact PostgreSQL bigint', () => {
    expect(parseShopMinimumPrice(undefined)).toBeNull();
    expect(parseShopMinimumPrice('0')).toBe(0n);
    expect(parseShopMinimumPrice('9007199254740993')).toBe(9007199254740993n);
    expect(parseShopMinimumPrice('9223372036854775807')).toBe(9223372036854775807n);
  });

  it.each(['', '01', '-1', '+1', '1.5', '1e3', ' 1', '1 ', 'Infinity', '9223372036854775808'])('rejects noncanonical or out-of-range minimum price %j', (value) => {
    expect(() => parseShopMinimumPrice(value)).toThrow(BadRequestException);
  });

  it('rejects multi-value query arrays and preserves exact price precision', () => {
    expect(() => parseShopMinimumPrice(['1', '2'])).toThrow(BadRequestException);
    const rows = [{ price: '9007199254740992', code: 'a' }, { price: '9007199254740993', code: 'b' }];
    expect(filterShopMinimumPrice(rows, 9007199254740993n)).toEqual([rows[1]]);
    expect(filterShopMinimumPrice(rows, null)).toEqual(rows);
  });
});
