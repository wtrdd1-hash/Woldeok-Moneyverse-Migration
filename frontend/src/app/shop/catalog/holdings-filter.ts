/** Preserve the independent catalogue search when changing the member shelf view. */
export function holdingsFilterUrl(catalogQuery: string, status: 'all' | 'attention'): string {
  const params = new URLSearchParams();
  if (catalogQuery.trim()) params.set('q', catalogQuery.trim());
  if (status === 'attention') params.set('mine', 'attention');
  const query = params.toString();
  return `/shop/catalog${query ? `?${query}` : ''}`;
}
