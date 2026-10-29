import { describe, expect, it } from 'vitest';
import { memberCatalogUrl, normalizedShopPriceOrder } from './shop-price-order';

describe('shop member price sort URL', () => {
  it('keeps default backend ordering and strict user-facing choices', () => {
    expect(normalizedShopPriceOrder(undefined)).toBe('default');
    expect(normalizedShopPriceOrder('price_asc')).toBe('price_asc');
    expect(normalizedShopPriceOrder('price_desc')).toBe('price_desc');
    expect(normalizedShopPriceOrder('price_asc,price_desc')).toBe('default');
  });
  it('passes explicit sort to owner-scoped API without forwarding arbitrary input', () => {
    expect(memberCatalogUrl('price_asc')).toBe('/api/v1/shop/catalog?sort=price_asc');
    expect(memberCatalogUrl('default')).toBe('/api/v1/shop/catalog');
  });
});
