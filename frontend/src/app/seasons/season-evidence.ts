/** Runtime evidence boundary for the authenticated Nest season API. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const WLD = /^(0|[1-9][0-9]{0,39})$/;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 5000;
const uuid = (v: unknown): v is string => typeof v === 'string' && UUID.test(v);
const money = (v: unknown): v is string => typeof v === 'string' && WLD.test(v);
const count = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const date = (v: unknown): v is string => typeof v === 'string' && ISO.test(v) && Number.isFinite(Date.parse(v));

export interface VerifiedSeasonEvent {
  readonly event_id: string;
  readonly season_id: string;
  readonly season_name: string;
  readonly title: string;
  readonly description: string;
  readonly cost_wld: string;
  readonly points_per_entry: number;
  readonly ends_at: string | null;
}

export function parseSeasonEvents(input: unknown): VerifiedSeasonEvent[] | null {
  if (!object(input) || !Array.isArray(input.events) || input.events.length > 100) return null;
  const ids = new Set<string>();
  const result: VerifiedSeasonEvent[] = [];
  for (const row of input.events as unknown[]) {
    if (!object(row) || !uuid(row.event_id) || !uuid(row.season_id) ||
      !text(row.season_name) || !text(row.title) || typeof row.description !== 'string' ||
      row.description.length > 5000 || !money(row.cost_wld) || !count(row.points_per_entry) ||
      !(row.ends_at === null || date(row.ends_at)) || ids.has(row.event_id.toLowerCase())) return null;
    ids.add(row.event_id.toLowerCase());
    result.push(row as unknown as VerifiedSeasonEvent);
  }
  return result;
}

export interface VerifiedCurrentSeason {
  readonly seasonId: string;
  readonly seasonName: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly lifecycleState: string;
  readonly totalParticipants: number;
  readonly myRank: number | null;
  readonly myScore: number;
  readonly myTier: string;
  readonly tierRewardWld: number;
  readonly tierTrophy: string | null;
}

export function parseCurrentSeason(input: unknown): VerifiedCurrentSeason | null {
  if (!object(input) || !object(input.currentSeason)) return null;
  const row = input.currentSeason;
  if (!uuid(row.seasonId) || !text(row.seasonName) || !date(row.startsAt) ||
    !date(row.endsAt) || Date.parse(row.startsAt) >= Date.parse(row.endsAt) ||
    !text(row.lifecycleState) || !count(row.totalParticipants) ||
    !(row.myRank === null || (count(row.myRank) && row.myRank > 0 && row.myRank <= row.totalParticipants)) ||
    !count(row.myScore) || !text(row.myTier) || !count(row.tierRewardWld) ||
    !(row.tierTrophy === null || text(row.tierTrophy))) return null;
  return row as unknown as VerifiedCurrentSeason;
}

export interface VerifiedLeaderboardEntry {
  readonly rank: number;
  readonly points: string;
  readonly entries: string;
  readonly display_name: string;
}

export function parseSeasonLeaderboard(input: unknown): VerifiedLeaderboardEntry[] | null {
  if (!object(input) || !Array.isArray(input.entries) || input.entries.length > 20) return null;
  const result: VerifiedLeaderboardEntry[] = [];
  let previousRank = 0;
  let previousPoints: bigint | null = null;
  for (const row of input.entries as unknown[]) {
    if (!object(row) || !count(row.rank) || row.rank <= previousRank ||
      !money(row.points) || !money(row.entries) || !text(row.display_name) ||
      row.display_name.length > 120) return null;
    const points = BigInt(row.points);
    if (previousPoints !== null && points > previousPoints) return null;
    previousPoints = points;
    previousRank = row.rank;
    result.push(row as unknown as VerifiedLeaderboardEntry);
  }
  return result;
}
