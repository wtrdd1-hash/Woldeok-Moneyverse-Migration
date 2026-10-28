export type ShopOwnership = 'all' | 'owned' | 'unowned';

export function normalizedShopOwnership(value: unknown): ShopOwnership {
  return value === 'owned' || value === 'unowned' ? value : 'all';
}

/** Only the authenticated member catalogue accepts ownership filtering. */
export function memberOwnershipCatalogUrl(ownership: ShopOwnership): string {
  return ownership === 'all'
    ? '/api/v1/shop/catalog'
    : `/api/v1/shop/catalog?ownership=${ownership}`;
}
