import { describe, expect, it } from 'vitest';
import { shopCatalogQuery, shopStockFilter } from './shop-stock';

describe('shop stock discovery navigation', () => {
  it('preserves a Unicode search and a sold-out selection', () => {
    const query = shopCatalogQuery('한정판 & badge', 'sold_out');
    const params = new URLSearchParams(query.slice(1));
    expect(params.get('q')).toBe('한정판 & badge');
    expect(params.get('stock')).toBe('sold_out');
    expect(shopStockFilter('sold_out')).toBe('sold_out');
  });
  it('preserves the available filter and defaults unknown filters to all', () => {
    expect(shopCatalogQuery('', 'available')).toBe('?stock=available');
    expect(shopStockFilter(['sold_out'])).toBe('all');
    expect(shopStockFilter('unknown')).toBe('all');
    expect(shopCatalogQuery('', 'all')).toBe('');
  });
});
