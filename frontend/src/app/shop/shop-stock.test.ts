import { describe, expect, it } from 'vitest';
import { shopCatalogQuery, shopStockFilter } from './shop-stock';

describe('shop in-stock navigation', () => {
  it('preserves a Unicode search and an available-stock selection', () => {
    const query = shopCatalogQuery('한정판 & badge', 'available');
    const params = new URLSearchParams(query.slice(1));
    expect(params.get('q')).toBe('한정판 & badge');
    expect(params.get('stock')).toBe('available');
  });
  it('does not accept an unrecognized stock query as a verified filter', () => {
    expect(shopStockFilter('sold_out')).toBe('all');
    expect(shopStockFilter(['available'])).toBe('all');
    expect(shopCatalogQuery('', 'all')).toBe('');
  });
});
