export interface VerifiedAuction {
  readonly id: string;
  readonly itemName: string;
  readonly sellerName: string;
  readonly rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  readonly currentBidWld: string;
  readonly startPriceWld: string;
  readonly bidCount: number;
  readonly endsAt: string;
  readonly description: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9][0-9]{0,29})(?:\.0{1,4})?$/;
const RARITIES = new Set(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']);

export function parseVerifiedAuctions(payload: unknown): readonly VerifiedAuction[] | null {
  if (!Array.isArray(payload) || payload.length > 200) return null;
  const ids = new Set<string>();
  const auctions: VerifiedAuction[] = [];
  for (const raw of payload) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const a = raw as Record<string, unknown>;
    if (typeof a.id !== 'string' || !UUID.test(a.id) || ids.has(a.id)) return null;
    if (typeof a.itemName !== 'string' || !a.itemName.trim() || a.itemName.length > 160 ||
        typeof a.sellerName !== 'string' || !a.sellerName.trim() || a.sellerName.length > 120 ||
        typeof a.rarity !== 'string' || !RARITIES.has(a.rarity) ||
        typeof a.startPriceWld !== 'string' || !WLD.test(a.startPriceWld) ||
        typeof a.currentBidWld !== 'string' || !WLD.test(a.currentBidWld) ||
        BigInt(a.currentBidWld.split('.')[0]!) < BigInt(a.startPriceWld.split('.')[0]!) ||
        typeof a.bidCount !== 'number' || !Number.isSafeInteger(a.bidCount) || a.bidCount < 0 ||
        typeof a.endsAt !== 'string' || !Number.isFinite(Date.parse(a.endsAt)) ||
        typeof a.description !== 'string' || a.description.length > 2000) return null;
    ids.add(a.id);
    auctions.push({
      id: a.id, itemName: a.itemName, sellerName: a.sellerName,
      rarity: a.rarity as VerifiedAuction['rarity'], startPriceWld: a.startPriceWld.split('.')[0]!,
      currentBidWld: a.currentBidWld.split('.')[0]!, bidCount: a.bidCount,
      endsAt: a.endsAt, description: a.description,
    });
  }
  return auctions;
}
