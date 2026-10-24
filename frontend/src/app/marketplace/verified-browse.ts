/**
 * Read-only projections of actual authenticated NestJS responses.
 *
 * A malformed or unavailable response must not be reinterpreted as an empty
 * marketplace or a zero balance. The legacy client-side trading mock cannot
 * establish ownership, a purchase receipt, or a ledger posting.
 */
export interface VerifiedListing {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly quantity: number;
  readonly priceWld: string;
  readonly description: string;
  readonly createdAt: string;
}

export interface VerifiedHolding {
  readonly id: string;
  readonly name: string;
  readonly quantity: number;
  readonly category: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INTEGER_WLD = /^(?:0|[1-9][0-9]*)$/;
const MARKET_PRICE = /^([1-9][0-9]*)(?:\.0{1,4})?$/;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown, max = 256): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

function wholeCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function parseCashBalance(input: unknown): string | null {
  const balances = record(record(input)?.balances);
  const cash = record(balances?.cash);
  const amount = cash?.availableAmount;
  return typeof amount === 'string' && INTEGER_WLD.test(amount) && amount.length <= 38
    ? amount
    : null;
}

export function parseMarketplaceHoldings(input: unknown): VerifiedHolding[] | null {
  const source = record(input)?.holdings;
  if (!Array.isArray(source) || source.length > 1000) return null;
  const items: VerifiedHolding[] = [];
  for (const value of source) {
    const row = record(value);
    if (!row || typeof row.catalog_id !== 'string' || !UUID.test(row.catalog_id)
      || !text(row.name) || !text(row.category, 80) || !wholeCount(row.quantity)) {
      return null;
    }
    items.push({ id: row.catalog_id, name: row.name, quantity: row.quantity, category: row.category });
  }
  return items;
}

export function parseMarketplaceListings(input: unknown): VerifiedListing[] | null {
  // The NestJS endpoint returns an array, not { listings: [...] }.
  if (!Array.isArray(input) || input.length > 50) return null;
  const seen = new Set<string>();
  const items: VerifiedListing[] = [];
  for (const value of input) {
    const row = record(value);
    const price = row?.price_wld;
    const match = typeof price === 'string' ? MARKET_PRICE.exec(price) : null;
    if (!row || typeof row.id !== 'string' || !UUID.test(row.id)
      || seen.has(row.id) || row.status !== 'ACTIVE'
      || !text(row.item_name) || !text(row.category, 80)
      || typeof row.description !== 'string' || row.description.length > 500
      || !wholeCount(row.quantity) || row.quantity === 0
      || !match || !match[1] || match[1].length > 38
      || !text(row.created_at, 60) || !Number.isFinite(Date.parse(row.created_at))) {
      return null;
    }
    seen.add(row.id);
    items.push({
      id: row.id,
      name: row.item_name,
      category: row.category,
      quantity: row.quantity,
      priceWld: match[1],
      description: row.description,
      createdAt: row.created_at,
    });
  }
  return items;
}
