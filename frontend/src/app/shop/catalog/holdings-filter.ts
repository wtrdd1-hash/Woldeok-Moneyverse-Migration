/** Preserve the independent catalogue search when changing the member shelf view. */
export function holdingsFilterUrl(catalogQuery: string, status: 'all' | 'attention', stock?: string): string {
  const params = new URLSearchParams();
  if (catalogQuery.trim()) params.set('q', catalogQuery.trim());
  if (status === 'attention') params.set('mine', 'attention');
  if (stock === 'available') params.set('stock', 'available');
  const query = params.toString();
  return `/shop/catalog${query ? `?${query}` : ''}`;
}
