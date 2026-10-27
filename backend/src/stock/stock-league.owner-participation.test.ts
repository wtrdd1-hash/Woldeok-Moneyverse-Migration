import { describe, expect, it, vi } from 'vitest';
import { StockLeagueController } from './stock-league.controller';
import { StockLeagueRepository } from './stock-league.repository';

const seasonId = '00000000-0000-4000-8000-000000000100';
const memberId = '00000000-0000-4000-8000-000000000200';
const otherId = '00000000-0000-4000-8000-000000000300';

describe('stock league owner participation outside top 20', () => {
  it('returns the enrolled member even when absent from the public top 20', async () => {
    const own = { userId: memberId, seasonId, rankPosition: 37, tier: 'Bronze', roiRate: 0 };
    const repository = {
      getCurrentSeason: vi.fn().mockResolvedValue({ id: seasonId }),
      getLeaderboard: vi.fn().mockResolvedValue(Array.from({ length: 20 }, (_, i) => ({ userId: 'other-' + i }))),
      getWhales: vi.fn().mockResolvedValue([]),
      getMyParticipation: vi.fn().mockResolvedValue(own),
      getMySubscriptions: vi.fn().mockResolvedValue([]),
    };
    const controller = new StockLeagueController(repository as any);
    const result = await controller.getCurrentLeague({ session: { user_id: memberId } } as any);
    expect(result.myParticipation).toEqual(own);
    expect(repository.getMyParticipation).toHaveBeenCalledWith(seasonId, memberId);
    expect(result.leaderboard).toHaveLength(20);
  });

  it('never requests member participation or subscriptions for a guest', async () => {
    const repository = {
      getCurrentSeason: vi.fn().mockResolvedValue({ id: seasonId }),
      getLeaderboard: vi.fn().mockResolvedValue([]),
      getWhales: vi.fn().mockResolvedValue([]),
      getMyParticipation: vi.fn(),
      getMySubscriptions: vi.fn(),
    };
    const result = await new StockLeagueController(repository as any).getCurrentLeague({} as any);
    expect(result.myParticipation).toBeNull();
    expect(repository.getMyParticipation).not.toHaveBeenCalled();
    expect(repository.getMySubscriptions).not.toHaveBeenCalled();
  });

  it('uses a parameterized season-and-owner SQL predicate and returns the owner only', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{
      id: 'participation-37', season_id: seasonId, user_id: memberId, user_name: 'member',
      initial_asset: '100000', current_asset: '110000', roi_rate: '10.0',
      rank_position: 37, tier: 'Bronze', is_whale: false, follower_count: 0,
      created_at: '2026-10-27T00:00:00Z',
    }] });
    const repo = new StockLeagueRepository({ query } as any);
    const result = await repo.getMyParticipation(seasonId, memberId);
    expect(result?.userId).toBe(memberId);
    expect(result?.rankPosition).toBe(37);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toMatch(/WHERE\s+season_id\s*=\s*\$1::uuid\s+AND\s+user_id\s*=\s*\$2::uuid/i);
    expect(sql).toMatch(/LIMIT\s+1/i);
    expect(params).toEqual([seasonId, memberId]);
    expect(params).not.toContain(otherId);
  });

  it('returns null when the authenticated member has no participation', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new StockLeagueRepository({ query } as any);
    expect(await repo.getMyParticipation(seasonId, memberId)).toBeNull();
  });

  it('represents a pending database rank as zero, never an invented first-place rank', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{
      id: 'participation-37', season_id: seasonId, user_id: memberId, user_name: 'member',
      initial_asset: '100000', current_asset: '110000', roi_rate: '10.0',
      rank_position: null, tier: 'Bronze', is_whale: false, follower_count: 0,
      created_at: '2026-10-27T00:00:00Z',
    }] });
    const repo = new StockLeagueRepository({ query } as any);
    expect((await repo.getMyParticipation(seasonId, memberId))?.rankPosition).toBe(0);
  });
  it('refuses to misrepresent WLD assets outside JavaScript safe integer precision', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{
      id: 'participation-large', season_id: seasonId, user_id: memberId, user_name: 'member',
      initial_asset: '9007199254740993', current_asset: '9007199254740993',
      roi_rate: '0', rank_position: 25, tier: 'Bronze',
      is_whale: false, follower_count: 0, created_at: '2026-10-27T00:00:00Z',
    }] });
    const repo = new StockLeagueRepository({ query } as any);
    await expect(repo.getMyParticipation(seasonId, memberId)).rejects.toThrow(/safe precision/i);
  });

});
