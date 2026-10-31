/** Rolling UTC duration windows; these are not KST calendar-day summaries. */
export type InventoryExpiryWindow = '7d' | '30d';
export type InventoryExpiryFilter = 'expiring_7d' | 'expiring_30d';

export function parseInventoryExpiryWindow(value: unknown): InventoryExpiryWindow | null {
  return value === '7d' || value === '30d' ? value : null;
}

export function inventoryExpiryFilter(window: InventoryExpiryWindow): InventoryExpiryFilter {
  return window === '7d' ? 'expiring_7d' : 'expiring_30d';
}

export function isVerifiedExpiryHoldings(
  payload: unknown,
  filter: InventoryExpiryFilter,
  now = Date.now(),
): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const record = payload as Record<string, unknown>;
  if (record.filter !== filter || !Array.isArray(record.holdings) || record.holdings.length > 50_000) return false;
  const seen = new Set<string>();
  const days = filter === 'expiring_7d' ? 7 : 30;
  // Tolerate short proxy/DB clock skew without accepting out-of-window results.
  const lower = now - 120_000;
  const upper = now + days * 86_400_000 + 120_000;
  for (const row of record.holdings) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return false;
    const item = row as Record<string, unknown>;
    if (typeof item.catalog_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.catalog_id) || seen.has(item.catalog_id)) return false;
    if (!Number.isSafeInteger(item.quantity) || (item.quantity as number) <= 0) return false;
    if (typeof item.expires_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(item.expires_at)) return false;
    const expiry = Date.parse(item.expires_at);
    if (!Number.isFinite(expiry) || expiry <= lower || expiry > upper) return false;
    seen.add(item.catalog_id);
  }
  return true;
}
