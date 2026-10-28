export function shopMinimumPriceQuery(q: string, minPrice: unknown): { valid: boolean; query: string } {
  if (minPrice !== undefined && minPrice !== '') {
    if (typeof minPrice !== 'string' || !/^(0|[1-9][0-9]{0,18})$/.test(minPrice) || BigInt(minPrice) > 9223372036854775807n) {
      return { valid: false, query: '' };
    }
  }
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (minPrice !== undefined && minPrice !== '') params.set('minPrice', String(minPrice));
  return { valid: true, query: params.size ? `?${params.toString()}` : '' };
}
