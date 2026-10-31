export type ShopStockFilter = 'all' | 'available' | 'sold_out';

export function shopStockFilter(value: unknown): ShopStockFilter {
  return value === 'available' || value === 'sold_out' ? value : 'all';
}

export function shopCatalogQuery(query: string, stock: ShopStockFilter): string {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (stock !== 'all') params.set('stock', stock);
  const encoded = params.toString();
  return encoded ? `?${encoded}` : '';
}
