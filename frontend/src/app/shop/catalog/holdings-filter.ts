/** Preserve the independent catalogue search when changing the member shelf view. */
export function holdingsFilterUrl(catalogQuery: string, status: 'all' | 'attention'): string {
  const params = new URLSearchParams();
  if (catalogQuery.trim()) params.set('q', catalogQuery.trim());
  if (status === 'attention') params.set('mine', 'attention');
  const query = params.toString();
  return `/shop/catalog${query ? `?${query}` : ''}`;
}


/** The Nest controller consumes `filter`, not the page's `mine` navigation key. */
export function holdingsApiUrl(status: 'all' | 'attention'): string {
  return `/api/v1/shop/holdings${status === 'attention' ? '?filter=attention' : ''}`;
}

/** Fail closed if a stale backend silently ignores the requested owner filter. */
export function isVerifiedAttentionHoldings(value: unknown): value is { holdings: readonly Record<string, unknown>[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const rows = (value as { holdings?: unknown }).holdings;
  if (!Array.isArray(rows)) return false;
  return rows.every((row: unknown) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const item = row as Record<string, unknown>;
    if (typeof item.catalog_id !== 'string' || item.catalog_id.length === 0 ||
        typeof item.suspended !== 'boolean' ||
        typeof item.unpaid_weeks !== 'number' || !Number.isSafeInteger(item.unpaid_weeks) || item.unpaid_weeks < 0 ||
        typeof item.arrears_due !== 'string' || !/^(0|[1-9][0-9]*)$/.test(item.arrears_due)) return false;
    return item.suspended || item.unpaid_weeks > 0 || BigInt(item.arrears_due) > 0n;
  });
}
