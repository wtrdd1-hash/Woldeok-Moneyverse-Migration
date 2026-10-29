import { describe, expect, it } from 'vitest';
import { compareShopCatalog, parseShopCompareIds } from './shop-compare';
import type { ShopCatalogListingRow } from './shop.repository';

const a = '11111111-1111-4111-8111-111111111111';
const b = '22222222-2222-4222-8222-222222222222';
const item = (id: string, price: string, upkeep: string): ShopCatalogListingRow => ({
  catalog_id: id, code: id, name: `Item ${id}`, description: 'Verified DB item',
  category: 'general', price, quantity: null, purchase_limit: 'once', effect_kind: 'none',
  maintenance_cost: upkeep, sale_ends_at: null, rarity: 'common', animation_css: null,
  preview_data: {}, max_stock: null, is_limited: false, user_owned_quantity: 0,
  user_is_equipped: false,
});

describe('shop verified comparison', () => {
  it('requires exactly two distinct canonical UUIDs', () => {
    expect(parseShopCompareIds(`${a},${b}`)).toEqual([a, b]);
    for (const bad of [undefined, '', a, `${a},${a}`, `${a},${b},${a}`, `${a},oops`, `${a},${b}%00`]) {
      expect(() => parseShopCompareIds(bad)).toThrow();
    }
  });
  it('keeps bigint price and weekly upkeep differences as exact decimal strings', () => {
    const result = compareShopCatalog([item(a, '9007199254740993000', '1000000000000000000'), item(b, '9007199254740993001', '3')], [a, b]);
    expect(result).toMatchObject({ source: 'shop_catalog_list_v2', priceDifference: '1',
      weeklyUpkeepDifference: '999999999999999997', cheaperCatalogId: a });
    expect(result.items.map((row) => row.price)).toEqual(['9007199254740993000', '9007199254740993001']);
  });
  it('refuses absent or withdrawn items rather than fabricating a comparison', () => {
    expect(() => compareShopCatalog([item(a, '1', '0')], [a, b])).toThrow();
  });
  it('fails closed on noncanonical amounts and never coerces JS unsafe numbers', () => {
    for (const bad of ['01', '-1', '1.5', 'NaN', '']) {
      expect(() => compareShopCatalog([item(a, bad, '0'), item(b, '2', '0')], [a, b])).toThrow();
    }
  });
  it('returns no cheaper item on exact equality', () => {
    expect(compareShopCatalog([item(a, '10', '0'), item(b, '10', '0')], [a, b])).toMatchObject({ cheaperCatalogId: null, priceDifference: '0' });
  });
});
