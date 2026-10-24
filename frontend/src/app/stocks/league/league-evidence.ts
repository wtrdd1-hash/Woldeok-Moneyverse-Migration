/** A display-only projection of the current PostgreSQL-backed league read API. */
export type LeagueEvidence =
  | { readonly state: 'unavailable' }
  | { readonly state: 'empty' }
  | {
      readonly state: 'ready';
      readonly seasonTitle: string;
      readonly participants: number;
      readonly traders: readonly {
        readonly id: string;
        readonly name: string;
        readonly rank: number;
        readonly returnRate: number;
      }[];
    };

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function projectLeague(value: unknown): LeagueEvidence {
  if (!record(value) || value.success !== true) return { state: 'unavailable' };
  if (value.season === null) return { state: 'empty' };
  if (!record(value.season) || !Array.isArray(value.leaderboard)) return { state: 'unavailable' };
  const season = value.season;
  if (
    typeof season.id !== 'string' || !season.id ||
    typeof season.title !== 'string' || !season.title.trim() ||
    season.status !== 'active' ||
    typeof season.totalParticipants !== 'number' ||
    !Number.isSafeInteger(season.totalParticipants) || season.totalParticipants < 0
  ) return { state: 'unavailable' };

  const traders: Array<{ id: string; name: string; rank: number; returnRate: number }> = [];
  const seen = new Set<string>();
  for (const item of value.leaderboard.slice(0, 20)) {
    if (!record(item) ||
      typeof item.id !== 'string' || !item.id || seen.has(item.id) ||
      typeof item.userName !== 'string' || !item.userName.trim() ||
      typeof item.rankPosition !== 'number' || !Number.isSafeInteger(item.rankPosition) ||
      item.rankPosition < 1 || item.rankPosition > 100000 ||
      typeof item.roiRate !== 'number' || !Number.isFinite(item.roiRate)
    ) return { state: 'unavailable' };
    seen.add(item.id);
    traders.push({
      id: item.id,
      name: item.userName.slice(0, 80),
      rank: item.rankPosition,
      returnRate: item.roiRate,
    });
  }
  return {
    state: 'ready',
    seasonTitle: season.title.slice(0, 120),
    participants: season.totalParticipants,
    traders,
  };
}
