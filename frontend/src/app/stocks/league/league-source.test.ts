import { describe, expect, it } from 'vitest';
import { parseLeagueSource } from './league-source';

const seasonId = '00000000-0000-4000-8000-000000000001';
const participantId = '00000000-0000-4000-8000-000000000002';
const valid = {
  success: true,
  season: { id: seasonId, title: 'Autumn League', status: 'active', totalParticipants: 1 },
  leaderboard: [{
    id: participantId, seasonId, userName: 'Member',
    rankPosition: 1, initialAsset: 1000, currentAsset: 1100,
    roiRate: 10, tier: 'Silver',
  }],
  whales: [],
  mySubscriptions: [{ whaleName: 'PRIVATE MEMBER', allocatedBudget: 9000 }],
};

describe('league authority parser', () => {
  it('projects only public verified standings, never member subscriptions', () => {
    const parsed = parseLeagueSource(valid);
    expect(parsed?.season?.title).toBe('Autumn League');
    expect(parsed?.leaderboard[0]?.roiRate).toBe(10);
    expect(JSON.stringify(parsed)).not.toContain('PRIVATE MEMBER');
    expect(JSON.stringify(parsed)).not.toContain('9000');
  });
  it('distinguishes an authoritative no-season result from outage', () => {
    expect(parseLeagueSource({ success: true, season: null, leaderboard: [], whales: [] }))
      .toEqual({ season: null, leaderboard: [] });
    expect(parseLeagueSource(null)).toBeNull();
    expect(parseLeagueSource({ success: false, season: null, leaderboard: [], whales: [] })).toBeNull();
    expect(parseLeagueSource({ success: true, season: null, leaderboard: [valid.leaderboard[0]], whales: [] })).toBeNull();
  });
  it('rejects unsafe WLD values, duplicate rows, malformed ranks and mismatched seasons', () => {
    expect(parseLeagueSource({ ...valid, leaderboard: [{ ...valid.leaderboard[0], currentAsset: 2 ** 60 }] })).toBeNull();
    expect(parseLeagueSource({ ...valid, leaderboard: [...valid.leaderboard, { ...valid.leaderboard[0], rankPosition: 2 }] })).toBeNull();
    expect(parseLeagueSource({ ...valid, leaderboard: [{ ...valid.leaderboard[0], rankPosition: 0 }] })).toBeNull();
    expect(parseLeagueSource({ ...valid, season: { ...valid.season, totalParticipants: 0 } })).toBeNull();
    expect(parseLeagueSource({ ...valid, leaderboard: [{ ...valid.leaderboard[0], seasonId: participantId }] })).toBeNull();
  });
  it('rejects invalid success envelopes and non-finite performance', () => {
    expect(parseLeagueSource({ ...valid, leaderboard: 'not-an-array' })).toBeNull();
    expect(parseLeagueSource({ ...valid, leaderboard: [{ ...valid.leaderboard[0], roiRate: Infinity }] })).toBeNull();
    expect(parseLeagueSource({ ...valid, season: { ...valid.season, status: 'settled' } })).toBeNull();
  });
});
