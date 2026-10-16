import { describe, expect, it } from 'vitest';
import { StockLeagueInputError, StockLeagueRepository } from './stock-league.repository';

class MockQueryable {
  public queries: Array<{ sql: string; params: any[] }> = [];
  public results: any[] = [];

  async query(sql: string, params: any[] = []) {
    this.queries.push({ sql, params });
    const nextResult = this.results.shift();
    return nextResult || { rows: [] };
  }
}

describe('StockLeagueRepository Unit Tests', () => {
  it('현재 진행 중인 활성 시즌을 정상 반환한다', async () => {
    const mockDb = new MockQueryable();
    mockDb.results.push({
      rows: [
        {
          id: 'season-1',
          season_number: 1,
          title: '제1회 챔피언십',
          starts_at: '2026-10-08T00:00:00Z',
          ends_at: '2026-10-22T00:00:00Z',
          entry_fee: '10000',
          prize_pool: '1000000',
          treasury_subsidy: '1000000',
          status: 'active',
          winner_id: null,
          winner_name: null,
          total_participants: 5,
          created_at: '2026-10-08T00:00:00Z',
        },
      ],
    });

    const repo = new StockLeagueRepository(mockDb as any);
    const season = await repo.getCurrentSeason();

    expect(season).not.toBeNull();
    expect(season?.seasonNumber).toBe(1);
    expect(season?.entryFee).toBe(10000);
    expect(season?.totalParticipants).toBe(5);
  });

  it('리더보드 순위 목록을 정상 계산하여 반환한다', async () => {
    const mockDb = new MockQueryable();
    mockDb.results.push({
      rows: [
        {
          id: 'part-1',
          season_id: 'season-1',
          user_id: 'user-1',
          user_name: '워렌버핏',
          initial_asset: '1000000',
          current_asset: '1500000',
          roi_rate: '50.0000',
          rank_position: 1,
          tier: 'Challenger',
          is_whale: true,
          follower_count: 12,
          created_at: '2026-10-08T00:00:00Z',
        },
      ],
    });

    const repo = new StockLeagueRepository(mockDb as any);
    const leaderboard = await repo.getLeaderboard('season-1', 10);

    expect(leaderboard.length).toBe(1);
    expect(leaderboard[0]?.userName).toBe('워렌버핏');
    expect(leaderboard[0]?.roiRate).toBe(50);
    expect(leaderboard[0]?.rankPosition).toBe(1);
    expect(leaderboard[0]?.tier).toBe('Challenger');
  });

  it('자기 자신을 카피 트레이딩할 수 없다', async () => {
    const mockDb = new MockQueryable();
    const repo = new StockLeagueRepository(mockDb as any);

    await expect(
      repo.subscribeCopyTrading('user-1', '나', 'user-1', '나', 50000)
    ).rejects.toThrow(StockLeagueInputError);
  });

  it('최소 할당 자본금(10,000 WLD) 미만이면 카피 트레이딩을 거부한다', async () => {
    const mockDb = new MockQueryable();
    const repo = new StockLeagueRepository(mockDb as any);

    await expect(
      repo.subscribeCopyTrading('user-1', '나', 'user-2', '고래', 5000)
    ).rejects.toThrow(StockLeagueInputError);
  });
});

describe('stock league entry fee is ledger-first', () => {
  it('charges into escrow via restricted ledger function and never raw balance UPDATE', async () => {
    const db = new MockQueryable();
    db.results.push(
      { rows: [{ id: '00000000-0000-4000-8000-000000000123', entry_fee: '10000', status:'active' }] },
      { rows: [{ is_admin: false }] },
      { rows: [] },
      { rows: [{ id:'cash', balance:'20000' }] },
      { rows: [{ transaction_id:'posted' }] },
      { rows: [] },
      { rows: [{ stock_val:'0' }] },
      { rows: [{ id:'participant-1', season_id:'00000000-0000-4000-8000-000000000123', user_id:'user-1',
        user_name:'회원', initial_asset:'100000', current_asset:'100000', roi_rate:'0',tier:'Bronze' }] },
    );
    const repo=new StockLeagueRepository(db as any);
    const result=await repo.joinSeason('user-1','회원');
    expect(result.id).toBe('participant-1');
    const sql=db.queries.map(q=>q.sql).join('\n');
    expect(sql).toContain('stock_league_settle_entry_fee($1::uuid, $2::uuid)');
    expect(sql).not.toMatch(/UPDATE public\.account_balances/i);
  });
});
