import { describe, expect, it } from 'vitest';
import { memberOwnershipCatalogUrl, normalizedShopOwnership } from './shop-ownership';

describe('member shop ownership URL', () => {
  it('normalizes unknown URL values to all without inventing holdings', () => {
    expect(normalizedShopOwnership(undefined)).toBe('all');
    expect(normalizedShopOwnership('owned')).toBe('owned');
    expect(normalizedShopOwnership('unowned')).toBe('unowned');
    expect(normalizedShopOwnership('OWNED')).toBe('all');
    expect(normalizedShopOwnership(['owned'])).toBe('all');
  });

  it('builds the owner-only API URL without exposing any user id', () => {
    expect(memberOwnershipCatalogUrl('all')).toBe('/api/v1/shop/catalog');
    expect(memberOwnershipCatalogUrl('owned')).toBe('/api/v1/shop/catalog?ownership=owned');
    expect(memberOwnershipCatalogUrl('unowned')).toBe('/api/v1/shop/catalog?ownership=unowned');
  });
});
