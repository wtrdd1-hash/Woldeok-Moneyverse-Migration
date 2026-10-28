import { describe, expect, it } from 'vitest';
import { filterShopByMaxPrice, parseShopMaxPrice } from './shop-price-ceiling';

describe('canonical shop price ceiling', () => {
  it('accepts absent/empty and exact 64-bit integer string bounds', () => {
    expect(parseShopMaxPrice(undefined)).toBeNull();
    expect(parseShopMaxPrice('')).toBeNull();
    expect(parseShopMaxPrice('0')).toBe(0n);
    expect(parseShopMaxPrice('9223372036854775807')).toBe(9223372036854775807n);
  });

  it.each([
    '01',
    '-1',
    '+1',
    '1.0',
    '1e3',
    ' 1',
    '1 ',
    '9223372036854775808',
    '999999999999999999999',
    'NaN',
    '１',
    ['1', '2'],
    1,
    null,
  ])('rejects invalid or ambiguous query %s', (value) => {
    expect(() => parseShopMaxPrice(value)).toThrow();
  });

  it('compares verified prices as bigint, never floating point', () => {
    const rows = [
      { code: 'a', price: '9007199254740992' },
      { code: 'b', price: '9007199254740993' },
      { code: 'c', price: '9223372036854775807' },
    ];
    expect(filterShopByMaxPrice(rows, 9007199254740992n).map((row) => row.code)).toEqual(['a']);
    expect(filterShopByMaxPrice(rows, 9223372036854775807n)).toEqual(rows);
    expect(filterShopByMaxPrice(rows, null)).toEqual(rows);
    expect(rows).toHaveLength(3);
  });

  it('fails closed if the DB returns noncanonical monetary data', () => {
    expect(() => filterShopByMaxPrice([{ price: '1.5' }], 2n)).toThrow();
    expect(() => filterShopByMaxPrice([{ price: 1 }], 2n)).toThrow();
  });
});
