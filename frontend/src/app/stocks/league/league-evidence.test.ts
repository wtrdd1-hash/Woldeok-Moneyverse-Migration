import { describe, expect, it } from 'vitest';
import { projectLeague } from './league-evidence';

const season = { id: 'season-1', title: 'Autumn League', status: 'active', totalParticipants: 1 };
const trader = { id: 'p-1', userName: 'Verified trader', roiRate: 4.5, rankPosition: 1, followerCount: 0 };

describe('verified stock league projection', () => {
  it('shows only backend-provided season and leaderboard, never a seeded whale', () => {
    expect(projectLeague({ success: true, season, leaderboard: [trader], whales: [] })).toEqual({
      state: 'ready', seasonTitle: 'Autumn League', participants: 1,
      traders: [{ id: 'p-1', name: 'Verified trader', returnRate: 4.5, rank: 1 }],
    });
  });
  it('distinguishes no active season from a failed API', () => {
    expect(projectLeague({ success: true, season: null, leaderboard: [], whales: [] }).state).toBe('empty');
    expect(projectLeague(null).state).toBe('unavailable');
    expect(projectLeague({ error: 'backend offline' }).state).toBe('unavailable');
  });
  it('rejects malformed, fabricated, and nonfinite financial data', () => {
    expect(projectLeague({ success: true, season, leaderboard: [{ ...trader, roiRate: Infinity }] }).state).toBe('unavailable');
    expect(projectLeague({ success: true, season, leaderboard: 'not an array' }).state).toBe('unavailable');
    expect(projectLeague({ success: true, season, leaderboard: [trader, { ...trader, id: 'p-2', roiRate: NaN }] }).state).toBe('unavailable');
  });
  it('bounds displayed rows and preserves the actual rank', () => {
    const rows = Array.from({ length: 35 }, (_, i) => ({ ...trader, id: `p-${i}`, rankPosition: i + 1 }));
    const result = projectLeague({ success: true, season, leaderboard: rows });
    expect(result.state).toBe('ready');
    if (result.state === 'ready') {
      expect(result.traders).toHaveLength(20);
      expect(result.traders[19]?.rank).toBe(20);
    }
  });
});
