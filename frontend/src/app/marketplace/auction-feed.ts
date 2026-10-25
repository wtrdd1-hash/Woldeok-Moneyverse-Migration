import { groupDigits } from '@/lib/money';

/** A read-only, server-backed English auction record. WLD is always an exact decimal string. */
export interface AuctionListing {
  readonly id: string;
  readonly itemName: string;
  readonly itemCode: string;
  readonly category: string;
  readonly rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  readonly sellerId: string;
  readonly sellerName: string;
  readonly startPriceWld: string;
  readonly currentBidWld: string;
  readonly highestBidderId: string | null;
  readonly highestBidderName: string | null;
  readonly bidCount: number;
  readonly buyNowPriceWld: string | null;
  readonly endsAt: string;
  readonly isExtended: boolean;
  readonly description: string;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const money = /^(0|[1-9][0-9]{0,15})(?:\.[0-9]{1,4})?$/;
const rarities = new Set(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);

function requiredString(value: unknown, max = 200): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function validMoney(value: unknown): value is string {
  return typeof value === 'string' && money.test(value);
}

function scaledWld(value: string): bigint {
  const [whole = '0', fractional = ''] = value.split('.');
  return BigInt(whole) * 10000n + BigInt(fractional.padEnd(4, '0') || '0');
}

/** Format exact numeric(20,4) WLD without floating-point conversion. */
export function formatAuctionWld(value: string): string {
  if (!validMoney(value)) return '—';
  const [whole = '0', fractional] = value.split('.');
  return groupDigits(whole) + (fractional && /[1-9]/.test(fractional) ? `.${fractional}` : '');
}

/** Reject an entire malformed response rather than showing misleading partial live listings. */
export function parseAuctionListings(value: unknown): AuctionListing[] {
  if (!Array.isArray(value) || value.length > 500) throw new Error('Invalid auction feed');
  const ids = new Set<string>();
  return value.map((item: unknown) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Invalid auction');
    const row = item as Record<string, unknown>;
    if (
      typeof row.id !== 'string' || !uuid.test(row.id) || ids.has(row.id) ||
      typeof row.sellerId !== 'string' || !uuid.test(row.sellerId) ||
      (row.highestBidderId !== null && (typeof row.highestBidderId !== 'string' || !uuid.test(row.highestBidderId))) ||
      !requiredString(row.itemName) || !requiredString(row.itemCode) || !requiredString(row.category) ||
      !requiredString(row.sellerName) || !rarities.has(row.rarity as string) ||
      typeof row.description !== 'string' || row.description.length > 2000 ||
      !validMoney(row.startPriceWld) || !validMoney(row.currentBidWld) ||
      scaledWld(row.currentBidWld) < scaledWld(row.startPriceWld) ||
      (row.buyNowPriceWld != null && !validMoney(row.buyNowPriceWld)) ||
      (row.highestBidderName !== null && !requiredString(row.highestBidderName)) ||
      !Number.isSafeInteger(row.bidCount) || (row.bidCount as number) < 0 ||
      typeof row.endsAt !== 'string' || !Number.isFinite(Date.parse(row.endsAt)) ||
      typeof row.isExtended !== 'boolean'
    ) throw new Error('Invalid auction');
    ids.add(row.id);
    return {
      id: row.id, itemName: row.itemName, itemCode: row.itemCode,
      category: row.category, rarity: row.rarity as AuctionListing['rarity'],
      sellerId: row.sellerId, sellerName: row.sellerName,
      startPriceWld: row.startPriceWld, currentBidWld: row.currentBidWld,
      highestBidderId: row.highestBidderId as string | null,
      highestBidderName: row.highestBidderName as string | null,
      bidCount: row.bidCount as number,
      buyNowPriceWld: (row.buyNowPriceWld as string | null) ?? null,
      endsAt: new Date(row.endsAt).toISOString(), isExtended: row.isExtended,
      description: row.description,
    };
  });
}
