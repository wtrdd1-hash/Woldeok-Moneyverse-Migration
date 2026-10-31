/** A member-facing listing is evidence from the guarded database read, never a local demo. */
export interface VerifiedMarketplaceListing {
  readonly id: string;
  readonly itemName: string;
  readonly quantity: number;
  readonly priceWld: string;
  readonly createdAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9]\d*)(?:\.0{1,4})?$/;

export function parseVerifiedMarketplaceListings(value: unknown): VerifiedMarketplaceListing[] | null {
  if (!Array.isArray(value) || value.length > 50) return null;
  const ids = new Set<string>();
  const result: VerifiedMarketplaceListing[] = [];

  for (const row of value) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) return null;
    const item = row as Record<string, unknown>;
    if (typeof item.id !== 'string' || !UUID.test(item.id) || ids.has(item.id.toLowerCase())) return null;
    if (item.status !== 'ACTIVE') return null;
    if (typeof item.item_name !== 'string' || !item.item_name.trim() || item.item_name.length > 160) return null;
    if (typeof item.quantity !== 'number' || !Number.isSafeInteger(item.quantity) || item.quantity < 1) return null;
    if (typeof item.price_wld !== 'string' || !WLD.test(item.price_wld) || item.price_wld.length > 30 || BigInt(item.price_wld.split(".")[0]!) < 1n) return null;
    if (typeof item.created_at !== 'string' || !/^\d{4}-\d\d-\d\d[T ]/.test(item.created_at) || !Number.isFinite(Date.parse(item.created_at))) return null;

    ids.add(item.id.toLowerCase());
    result.push({
      id: item.id,
      itemName: item.item_name,
      quantity: item.quantity,
      priceWld: item.price_wld.split('.')[0]!,
      createdAt: item.created_at,
    });
  }
  return result;
}
