/** Verify that a server-filtered catalogue contains only positively available or unlimited stock.
 * An HTTP 200 from an older backend can ignore the optional stock selector. */
export function isVerifiedAvailableShopCatalog(payload: unknown): boolean {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return false;
  const rows = (payload as { catalogItems?: unknown }).catalogItems;
  if (!Array.isArray(rows) || rows.length > 5000) return false;
  const ids = new Set<string>();
  for (const item of rows) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return false;
    const row = item as Record<string, unknown>;
    if (typeof row.catalog_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(row.catalog_id) || ids.has(row.catalog_id)) return false;
    if (typeof row.code !== 'string' || row.code.length === 0 || row.code.length > 120 ||
        typeof row.price !== 'string' || !/^(0|[1-9][0-9]{0,29})$/.test(row.price)) return false;
    if (row.quantity !== null && (!Number.isSafeInteger(row.quantity) || (row.quantity as number) <= 0)) return false;
    ids.add(row.catalog_id);
  }
  return true;
}
