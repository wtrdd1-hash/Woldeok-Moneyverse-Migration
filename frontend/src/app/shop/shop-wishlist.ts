/** Strictly verify private server receipts before updating member UI. */
export interface ShopWishlistItem {
  readonly catalogId: string;
  readonly name: string | null;
  readonly price: string | null;
  readonly available: boolean;
  readonly version: number;
  readonly updatedAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const AMOUNT = /^[1-9][0-9]{0,37}$/;

export function normalizeShopWishlist(payload: unknown): ShopWishlistItem[] | null {
  if (!payload || typeof payload !== 'object' || !('items' in payload)) return null;
  const items = payload.items;
  if (!Array.isArray(items) || items.length > 50) return null;
  const result: ShopWishlistItem[] = [];
  const seen = new Set<string>();
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') return null;
    const row = raw as Record<string, unknown>;
    const id = row.catalog_id ?? row.catalogId;
    const updatedAt = row.updated_at ?? row.updatedAt;
    if (typeof id !== 'string' || !UUID.test(id) || seen.has(id) ||
        typeof row.available !== 'boolean' ||
        !Number.isSafeInteger(row.version) || Number(row.version) < 1 ||
        typeof updatedAt !== 'string' || Number.isNaN(Date.parse(updatedAt))) return null;
    if (row.available) {
      if (typeof row.name !== 'string' || !row.name.trim() ||
          typeof row.price !== 'string' || !AMOUNT.test(row.price)) return null;
    } else if (row.name !== null || row.price !== null) return null;
    seen.add(id);
    result.push({
      catalogId: id,
      name: row.name as string | null,
      price: row.price as string | null,
      available: row.available,
      version: Number(row.version),
      updatedAt,
    });
  }
  return result;
}

export function wishlistAction(receipt: unknown, expectedSaved: boolean): boolean {
  if (!receipt || typeof receipt !== 'object') return false;
  const row = receipt as Record<string, unknown>;
  return row.saved === expectedSaved && typeof row.replayed === 'boolean' &&
    Number.isSafeInteger(row.version) && Number(row.version) >= 0 &&
    typeof row.receiptId === 'string' && UUID.test(row.receiptId);
}
