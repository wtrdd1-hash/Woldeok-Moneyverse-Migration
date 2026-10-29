import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { filterCatalogRarity, parseShopRarity } from './shop-rarity-filter';

const rows = [
  { code: 'gloves', rarity: 'common', price: '1', user_owned_quantity: 0 },
  { code: 'rare_frame', rarity: 'rare', price: '9007199254740993', user_owned_quantity: 1 },
  { code: 'legend', rarity: 'legendary', price: '999999999999999999', user_owned_quantity: 0 },
] as const;

describe('verified shop rarity filter', () => {
  it('accepts only the six persisted rarity values and an omitted filter', () => {
    for (const rarity of ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']) {
      expect(parseShopRarity(rarity)).toBe(rarity);
    }
    expect(parseShopRarity(undefined)).toBeNull();
    expect(parseShopRarity('')).toBeNull();
  });

  it('rejects arrays, unknown, case-changed and unsafe tokens before a DB read', () => {
    for (const value of [['rare', 'common'], ['rare'], 'Rare', 'all', 'rare ', '../rare', 12, null]) {
      expect(() => parseShopRarity(value)).toThrow(BadRequestException);
    }
  });

  it('filters only the authorized database read-model rows without changing money or ownership', () => {
    expect(filterCatalogRarity(rows, null)).toEqual(rows);
    expect(filterCatalogRarity(rows, 'rare')).toEqual([rows[1]]);
    expect(filterCatalogRarity(rows, 'mythic')).toEqual([]);
    expect(rows[1].price).toBe('9007199254740993');
  });
});
