export type ShopPriceOrder = 'default' | 'price_asc' | 'price_desc';

export function normalizedShopPriceOrder(value: unknown): ShopPriceOrder {
  return value === 'price_asc' || value === 'price_desc' ? value : 'default';
}

export function memberCatalogUrl(sort: ShopPriceOrder): string {
  return sort === 'default' ? '/api/v1/shop/catalog' : `/api/v1/shop/catalog?sort=${sort}`;
}
