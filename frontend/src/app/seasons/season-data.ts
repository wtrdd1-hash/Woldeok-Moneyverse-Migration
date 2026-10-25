/** The season controller wraps current member standing and the settled archive. */
export interface VerifiedCurrentSeason {
  readonly seasonId: string;
  readonly seasonName: string;
  readonly lifecycleState: string;
  readonly myScore: number;
  readonly myTier: string;
  readonly myRank: number | null;
  readonly tierRewardWld: number;
  readonly tierTrophy: string | null;
}

export interface VerifiedHonoree {
  readonly rank: number;
  readonly displayName: string;
  readonly score: number;
  readonly trophyName: string;
}

export interface VerifiedHallSeason {
  readonly seasonId: string;
  readonly seasonName: string;
  readonly settledAt: string;
  readonly honorees: readonly VerifiedHonoree[];
}

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;
const count = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const positive = (value: unknown): value is number => count(value) && value > 0;

export function parseCurrentSeason(payload: unknown): VerifiedCurrentSeason | null {
  if (!record(payload) || !record(payload.currentSeason)) return null;
  const season = payload.currentSeason;
  if (!text(season.seasonId) || !text(season.seasonName) ||
      !text(season.lifecycleState) || !text(season.myTier) ||
      !count(season.myScore) || !count(season.tierRewardWld) ||
      (season.myRank !== null && !positive(season.myRank)) ||
      (season.tierTrophy !== null && typeof season.tierTrophy !== 'string')) return null;
  return {
    seasonId: season.seasonId,
    seasonName: season.seasonName,
    lifecycleState: season.lifecycleState,
    myScore: season.myScore,
    myTier: season.myTier,
    myRank: season.myRank,
    tierRewardWld: season.tierRewardWld,
    tierTrophy: season.tierTrophy,
  };
}

export function parseHallOfFame(payload: unknown): readonly VerifiedHallSeason[] | null {
  if (!record(payload) || !Array.isArray(payload.hallOfFame)) return null;
  const seasons: VerifiedHallSeason[] = [];
  for (const value of payload.hallOfFame) {
    if (!record(value) || !text(value.seasonId) || !text(value.seasonName) ||
        !text(value.settledAt) || Number.isNaN(Date.parse(value.settledAt)) ||
        !Array.isArray(value.honorees)) return null;
    const honorees: VerifiedHonoree[] = [];
    for (const person of value.honorees) {
      if (!record(person) || !positive(person.rank) || !text(person.displayName) ||
          !count(person.score) || !text(person.trophyName)) return null;
      honorees.push({ rank: person.rank, displayName: person.displayName,
        score: person.score, trophyName: person.trophyName });
    }
    seasons.push({ seasonId: value.seasonId, seasonName: value.seasonName,
      settledAt: value.settledAt, honorees });
  }
  return seasons;
}

/** The current season's projected tier reward is not a claimable settlement. */
export function canOfferSeasonClaim(season: VerifiedCurrentSeason | null): season is VerifiedCurrentSeason {
  return season?.lifecycleState === 'closed' &&
    (season.tierRewardWld > 0 || Boolean(season.tierTrophy));
}
