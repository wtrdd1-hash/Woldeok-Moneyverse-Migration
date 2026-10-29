import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { filterShopItems, parseShopCategory } from './shop.controller';

const rows = [
  { code: 'used_bicycle', name: 'Bicycle', category: 'vehicle', price: '9007199254740993' },
  { code: 'gloves', name: 'Gloves', category: 'general', price: '40' },
  { code: 'truck', name: 'Truck', category: 'vehicle', price: '999999999999999999' },
] as const;

describe('verified shop category selection', () => {
  it('filters the same bounded database read model by exact category without rounding prices', () => {
    expect(filterShopItems(rows, undefined, 'vehicle')).toEqual([rows[0], rows[2]]);
    expect(filterShopItems(rows, 'truck', 'vehicle')).toEqual([rows[2]]);
    expect(filterShopItems(rows, undefined, 'Vehicle')).toEqual([]);
  });

  it('keeps the original catalog unchanged when the category is omitted', () => {
    expect(filterShopItems(rows)).toEqual(rows);
    expect(parseShopCategory(undefined)).toBeNull();
    expect(parseShopCategory('')).toBeNull();
  });

  it('rejects arrays, overlong or unsafe category tokens before any database read', () => {
    for (const value of [['vehicle'], '../vehicle', 'vehicle;drop', 'a'.repeat(41), 5]) {
      expect(() => parseShopCategory(value)).toThrow(BadRequestException);
    }
    expect(parseShopCategory('vehicle')).toBe('vehicle');
  });
});
