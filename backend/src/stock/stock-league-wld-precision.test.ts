import { describe, expect, it, vi } from 'vitest';
import { StockLeagueRepository } from './stock-league.repository';

const unsafe = '9007199254740993';
const baseSeason = {
  id: 'season', season_number: 1, title: 'Season', starts_at: '2026-10-29T00:00:00Z',
  ends_at: '2026-11-29T00:00:00Z', entry_fee: '100', prize_pool: '500',
  treasury_subsidy: '50', status: 'active', winner_id: null, winner_name: null,
  total_participants: 1, created_at: '2026-10-29T00:00:00Z',
};
const baseParticipant = {
  id: 'participation', season_id: 'season', user_id: 'owner', user_name: 'Owner',
  initial_asset: '1000', current_asset: '1500', roi_rate: '50', rank_position: 1,
  tier: 'Bronze', is_whale: false, follower_count: 0, created_at: '2026-10-29T00:00:00Z',
};
const baseSubscription = {
  id: 'subscription', follower_id: 'owner', follower_name: 'Owner',
  whale_id: 'whale', whale_name: 'Whale', allocated_budget: '1000',
  used_budget: '100', copy_ratio: '1', total_profit_shared: '10',
  status: 'active', created_at: '2026-10-29T00:00:00Z',
};

function repoFor(row: Record<string, unknown>) {
  const query = vi.fn().mockResolvedValue({ rows: [row] });
  return { repo: new StockLeagueRepository({ query } as any), query };
}

describe('P1 stock league WLD read precision', () => {
  it('rejects unsafe season entry fees instead of rounding a NUMERIC', async () => {
    const { repo } = repoFor({ ...baseSeason, entry_fee: unsafe });
    await expect(repo.getCurrentSeason()).rejects.toMatchObject({ status: 503 });
  });
  it('rejects unsafe leaderboard member balances', async () => {
    const { repo } = repoFor({ ...baseParticipant, current_asset: unsafe });
    await expect(repo.getLeaderboard('season')).rejects.toMatchObject({ status: 503 });
  });
  it('rejects unsafe whale initial balances', async () => {
    const { repo } = repoFor({ ...baseParticipant, initial_asset: unsafe });
    await expect(repo.getWhales()).rejects.toMatchObject({ status: 503 });
  });
  it('rejects unsafe member copy subscription budgets', async () => {
    const { repo } = repoFor({ ...baseSubscription, allocated_budget: unsafe });
    await expect(repo.getMySubscriptions('owner')).rejects.toMatchObject({ status: 503 });
  });
  it('rejects fractional NUMERIC rounded down to a safe integer', async () => {
    const { repo } = repoFor({ ...baseSeason, entry_fee: '9007199254740991.01' });
    await expect(repo.getCurrentSeason()).rejects.toMatchObject({ status: 503 });
  });
  it('rejects nonzero fractional WLD and accepts PostgreSQL NUMERIC .00', async () => {
    const { repo: fractional } = repoFor({ ...baseSeason, prize_pool: '100.50' });
    await expect(fractional.getCurrentSeason()).rejects.toMatchObject({ status: 503 });
    const { repo: whole } = repoFor({ ...baseSeason, prize_pool: '100.00' });
    await expect(whole.getCurrentSeason()).resolves.toMatchObject({ prizePool: 100 });
  });
  it('preserves exact safe integer WLD read values', async () => {
    const { repo } = repoFor({ ...baseSeason, entry_fee: '9007199254740991' });
    await expect(repo.getCurrentSeason()).resolves.toMatchObject({ entryFee: 9007199254740991 });
  });
});
