/** Authoritative NestJS/PostgreSQL marketplace listing rows. Never synthesize ownership or receipts. */
export interface VerifiedMarketplaceListing {
  readonly id: string;
  readonly sellerId: string;
  readonly itemCode: string;
  readonly name: string;
  readonly category: string;
  readonly rarity: string;
  readonly quantity: number;
  readonly priceWld: string;
  readonly status: 'ACTIVE' | 'RESERVED' | 'SETTLED' | 'CANCELLED' | 'EXPIRED';
  readonly description: string;
  readonly listedAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^\d{1,20}(?:\.\d{1,4})?$/;
const STATUSES = new Set(['ACTIVE', 'RESERVED', 'SETTLED', 'CANCELLED', 'EXPIRED']);
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const nonEmpty = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0 && value.length <= 255;

/** null = unavailable or invalid response; [] = confirmed no rows. */
export function parseMarketplaceListings(value: unknown): VerifiedMarketplaceListing[] | null {
  if (!Array.isArray(value) || value.length > 5000) return null;
  const result: VerifiedMarketplaceListing[] = [];
  const seen = new Set<string>();
  for (const raw of value) {
    if (!record(raw)) return null;
    const {
      id, seller_id, item_code, item_name, category, rarity, quantity,
      price_wld, status, description, created_at,
    } = raw;
    if (
      typeof id !== 'string' || !UUID.test(id) || seen.has(id) ||
      typeof seller_id !== 'string' || !UUID.test(seller_id) ||
      !nonEmpty(item_code) || !nonEmpty(item_name) || !nonEmpty(category) ||
      !nonEmpty(rarity) || !Number.isSafeInteger(quantity) || (quantity as number) <= 0 ||
      typeof price_wld !== 'string' || !AMOUNT.test(price_wld) ||
      !/[1-9]/.test(price_wld) ||
      typeof status !== 'string' || !STATUSES.has(status) ||
      typeof description !== 'string' || description.length > 1000 ||
      typeof created_at !== 'string' || !Number.isFinite(Date.parse(created_at))
    ) return null;
    seen.add(id);
    result.push({
      id, sellerId: seller_id, itemCode: item_code, name: item_name,
      category, rarity, quantity: quantity as number, priceWld: price_wld,
      status: status as VerifiedMarketplaceListing['status'],
      description, listedAt: created_at,
    });
  }
  return result;
}

/** Preserve PostgreSQL numeric(20,4) exactly; integer-only WLD formatter would hide decimals. */
export function formatMarketplacePrice(value: string): string {
  const [integer, fraction] = value.split('.');
  const grouped = (integer ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction === undefined ? grouped : grouped + '.' + fraction;
}
