import { describe, expect, it } from 'vitest';
import { parseCurrentSeason, parseSeasonEvents, parseSeasonLeaderboard } from './season-evidence';

const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
const event = {
  event_id: A, season_id: B, season_name: 'Season 1', title: 'Launch',
  description: 'Event', cost_wld: '100', points_per_entry: 5,
  ends_at: '2026-12-01T00:00:00.000Z',
};
const current = {
  seasonId: B, seasonName: 'Season 1', startsAt: '2026-10-01T00:00:00.000Z',
  endsAt: '2026-12-01T00:00:00.000Z', lifecycleState: 'active',
  totalParticipants: 12, myRank: 2, myScore: 30, myTier: 'Silver',
  tierRewardWld: 150, tierTrophy: null,
};

describe('season evidence boundary', () => {
  it('reads the actual authenticated currentSeason envelope, not a fictitious flat DTO', () => {
    expect(parseCurrentSeason({ currentSeason: current })).toEqual(current);
    expect(parseCurrentSeason(current)).toBeNull();
  });

  it('rejects malformed or unverified member season metrics', () => {
    expect(parseCurrentSeason({ currentSeason: { ...current, myRank: -1 } })).toBeNull();
    expect(parseCurrentSeason({ currentSeason: { ...current, tierRewardWld: Infinity } })).toBeNull();
    expect(parseCurrentSeason({ currentSeason: { ...current, seasonId: 'wrong' } })).toBeNull();
    expect(parseCurrentSeason({ currentSeason: { ...current, totalParticipants: 1 } })).toBeNull();
    expect(parseCurrentSeason({ currentSeason: { ...current, startsAt: 'invalid' } })).toBeNull();
  });

  it('accepts a verified empty event list but rejects invalid or duplicate paid events', () => {
    expect(parseSeasonEvents({ events: [] })).toEqual([]);
    expect(parseSeasonEvents({ events: [event] })).toEqual([event]);
    expect(parseSeasonEvents({ events: [event, event] })).toBeNull();
    expect(parseSeasonEvents({ events: [{ ...event, cost_wld: '-10' }] })).toBeNull();
    expect(parseSeasonEvents({ events: [{ ...event, points_per_entry: NaN }] })).toBeNull();
    expect(parseSeasonEvents({ events: [{ ...event, event_id: 'not-uuid' }] })).toBeNull();
    expect(parseSeasonEvents({ events: 'nope' })).toBeNull();
  });

  it('validates leaderboard ordering and nonnegative exact integer strings', () => {
    expect(parseSeasonLeaderboard({ entries: [] })).toEqual([]);
    const entries = [{ rank: 1, points: '20', entries: '2', display_name: 'First' },
      { rank: 2, points: '10', entries: '1', display_name: 'Second' }];
    expect(parseSeasonLeaderboard({ entries })).toEqual(entries);
    expect(parseSeasonLeaderboard({ entries: [entries[1], entries[0]] })).toBeNull();
    expect(parseSeasonLeaderboard({ entries: [{ ...entries[0], points: '1.2' }] })).toBeNull();
    expect(parseSeasonLeaderboard({ entries: [{ ...entries[0], rank: -1 }] })).toBeNull();
    expect(parseSeasonLeaderboard({ entries: [{ ...entries[0], display_name: '' }] })).toBeNull();
  });
});
