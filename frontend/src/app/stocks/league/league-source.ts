/** Public, read-only projection of the authenticated league source. No member IDs or copy subscriptions. */
export interface VerifiedLeague {
  readonly season: { readonly id: string; readonly title: string; readonly totalParticipants: number } | null;
  readonly leaderboard: ReadonlyArray<{
    readonly id: string;
    readonly userName: string;
    readonly rankPosition: number;
    readonly roiRate: number;
    readonly initialAsset: number;
    readonly currentAsset: number;
    readonly tier: string;
  }>;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const tiers = new Set(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Challenger']);
const record = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);
const count = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;
const name = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= 100;

/**
 * Fail closed on malformed authority. In particular an API failure is not an
 * empty season, and a synthetic trader must never replace missing evidence.
 */
export function parseLeagueSource(raw: unknown): VerifiedLeague | null {
  if (!record(raw) || raw.success !== true || !Array.isArray(raw.leaderboard)) return null;
  if (raw.season === null) {
    return raw.leaderboard.length === 0 && Array.isArray(raw.whales) && raw.whales.length === 0
      ? { season: null, leaderboard: [] }
      : null;
  }
  if (!record(raw.season) || !uuid.test(String(raw.season.id)) ||
      !name(raw.season.title) || raw.season.status !== 'active' ||
      !count(raw.season.totalParticipants)) return null;
  if (raw.leaderboard.length > 20 || raw.leaderboard.length > raw.season.totalParticipants) return null;

  const ids = new Set<string>();
  const leaderboard: VerifiedLeague['leaderboard'][number][] = [];
  for (const item of raw.leaderboard) {
    if (!record(item) || typeof item.id !== 'string' || !uuid.test(item.id) ||
        item.seasonId !== raw.season.id || !name(item.userName) ||
        !count(item.rankPosition) || item.rankPosition === 0 ||
        item.rankPosition !== leaderboard.length + 1 ||
        !count(item.initialAsset) || !count(item.currentAsset) ||
        typeof item.roiRate !== 'number' || !Number.isFinite(item.roiRate) ||
        Math.abs(item.roiRate) > 1000000 ||
        typeof item.tier !== 'string' || !tiers.has(item.tier) ||
        ids.has(item.id)) return null;
    ids.add(item.id);
    leaderboard.push({
      id: item.id,
      userName: item.userName,
      rankPosition: item.rankPosition,
      roiRate: item.roiRate,
      initialAsset: item.initialAsset,
      currentAsset: item.currentAsset,
      tier: item.tier,
    });
  }
  return {
    season: { id: String(raw.season.id), title: raw.season.title, totalParticipants: raw.season.totalParticipants },
    leaderboard,
  };
}
