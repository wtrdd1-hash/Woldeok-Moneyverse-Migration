/** Fail closed on unverifiable league evidence rather than inventing a leaderboard. */
export interface VerifiedWhale {
  readonly id: string;
  readonly seasonId: string;
  readonly userId: string;
  readonly userName: string;
  readonly initialAsset: number;
  readonly currentAsset: number;
  readonly roiRate: number;
  readonly rankPosition: number;
  readonly tier: string;
  readonly isWhale: boolean;
  readonly followerCount: number;
  readonly createdAt: string;
}

export interface VerifiedLeague {
  readonly season: { readonly id: string; readonly title: string; readonly status: 'active'; readonly startsAt: string; readonly endsAt: string } | null;
  readonly whales: readonly VerifiedWhale[];
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const tiers = new Set(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Challenger']);
const record = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const uuid = (value: unknown): value is string => typeof value === 'string' && uuidPattern.test(value);
const validDate = (value: unknown): value is string => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
const amount = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const count = (value: unknown): value is number => amount(value);

export function verifyStockLeague(value: unknown): VerifiedLeague | null {
  if (!record(value) || value.success !== true || !Array.isArray(value.whales) || !Array.isArray(value.leaderboard) || value.whales.length > 10) return null;
  const season = value.season;
  if (season === null) {
    return value.whales.length === 0 && value.leaderboard.length === 0 ? { season: null, whales: [] } : null;
  }
  if (!record(season) || !uuid(season.id) || season.status !== 'active' || typeof season.title !== 'string' || season.title.trim().length === 0 || season.title.length > 200 || !validDate(season.startsAt) || !validDate(season.endsAt) || Date.parse(season.startsAt) >= Date.parse(season.endsAt)) return null;
  const seen = new Set<string>();
  const whales: VerifiedWhale[] = [];
  for (const item of value.whales) {
    if (!record(item) || !uuid(item.id) || !uuid(item.userId) || item.seasonId !== season.id || typeof item.userName !== 'string' || item.userName.trim().length === 0 || item.userName.length > 100 || !amount(item.initialAsset) || !amount(item.currentAsset) || typeof item.roiRate !== 'number' || !Number.isFinite(item.roiRate) || item.roiRate < -100 || item.roiRate > 100000 || !count(item.rankPosition) || !count(item.followerCount) || typeof item.tier !== 'string' || !tiers.has(item.tier) || typeof item.isWhale !== 'boolean' || !validDate(item.createdAt) || seen.has(item.id) || seen.has(item.userId)) return null;
    seen.add(item.id);
    seen.add(item.userId);
    whales.push(item as unknown as VerifiedWhale);
  }
  return { season: { id: season.id, title: season.title, status: 'active', startsAt: season.startsAt, endsAt: season.endsAt }, whales };
}
