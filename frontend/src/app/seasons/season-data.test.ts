import { describe, expect, it } from 'vitest';
import { parseCurrentSeason, parseHallOfFame, canOfferSeasonClaim } from './season-data';

describe('NestJS season response contract', () => {
  it('reads the currentSeason wrapper rather than assuming the response is a season', () => {
    expect(parseCurrentSeason({ currentSeason: {
      seasonId: 's1', seasonName: 'Actual', myScore: 25, myTier: 'BRONZE', myRank: 4, lifecycleState: 'active', tierRewardWld: 100, tierTrophy: null,
    } })).toMatchObject({ seasonName: 'Actual', myScore: 25 });
    expect(parseCurrentSeason({ seasonName: 'fake', myScore: 100 })).toBeNull();
    expect(parseCurrentSeason(null)).toBeNull();
  });

  it('accepts only the hallOfFame wrapper with well-formed honorees', () => {
    expect(parseHallOfFame({ hallOfFame: [] })).toEqual([]);
    expect(parseHallOfFame({ hallOfFame: [{ seasonId: 's1', seasonName: 'Actual', settledAt: '2026-10-01T00:00:00Z', honorees: [
      { rank: 1, userId: 'u1', displayName: 'Verified', score: 12, trophyCode: 'gold', trophyName: 'Gold' },
    ] }] })?.[0]?.honorees[0]?.displayName).toBe('Verified');
    expect(parseHallOfFame({ hallOfFame: [{ honorees: [{ rank: 1 }] }] })).toBeNull();
    expect(parseHallOfFame({})).toBeNull();
  });
  it('does not offer projected rewards while the season is still active', () => {
    const current = parseCurrentSeason({ currentSeason: {
      seasonId: 's1', seasonName: 'Actual', myScore: 25, myTier: 'Gold', myRank: 1,
      lifecycleState: 'active', tierRewardWld: 500, tierTrophy: 'gold',
    } });
    expect(canOfferSeasonClaim(current)).toBe(false);
    expect(canOfferSeasonClaim(current && { ...current, lifecycleState: 'closed' })).toBe(true);
    expect(canOfferSeasonClaim(null)).toBe(false);
  });

});
