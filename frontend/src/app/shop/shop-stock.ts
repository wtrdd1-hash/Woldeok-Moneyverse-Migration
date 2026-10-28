export type ShopStockFilter = 'all' | 'available';

export function shopStockFilter(value: unknown): ShopStockFilter {
  return value === 'available' ? 'available' : 'all';
}

export function shopCatalogQuery(query: string, stock: ShopStockFilter): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (stock === 'available') params.set('stock', 'available');
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}
