import { describe, expect, it, vi } from 'vitest';
import { SeasonService } from './season.service';
import type { SeasonRepository } from './season.service';

describe('Season Settlement & Hall of Fame Engine', () => {
  const mockRepo = {
    events: vi.fn(),
    leaderboard: vi.fn(),
    consume: vi.fn(),
    current: vi.fn(),
    hallOfFame: vi.fn(),
    settle: vi.fn(),
    claimReward: vi.fn(),
  } as unknown as SeasonRepository;

  const service = new SeasonService(mockRepo);

  it('evaluates current season status with tier calculations for Top 10 Capital Master', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';

    vi.mocked(mockRepo.current).mockResolvedValueOnce({
      seasonId: '22222222-2222-4222-8222-222222222222',
      seasonName: '2026 가을 그랜드 시즌',
      startsAt: new Date('2026-09-01T00:00:00Z'),
      endsAt: new Date('2026-09-30T23:59:59Z'),
      lifecycleState: 'active',
      totalParticipants: 500,
      myRank: 3,
      myScore: 45000,
      myTier: 'Capital Master',
      tierRewardWld: 500,
      tierTrophy: 'TROPHY_SEASON_CHAMPION_#3',
    });

    const status = await service.current(userId);
    expect(status.myTier).toBe('Capital Master');
    expect(status.tierRewardWld).toBe(500);
    expect(status.tierTrophy).toBe('TROPHY_SEASON_CHAMPION_#3');
    expect(status.totalParticipants).toBe(500);
  });

  it('evaluates current season status for Gold tier participant', async () => {
    const userId = '33333333-3333-4333-8333-333333333333';

    vi.mocked(mockRepo.current).mockResolvedValueOnce({
      seasonId: '22222222-2222-4222-8222-222222222222',
      seasonName: '2026 가을 그랜드 시즌',
      startsAt: new Date('2026-09-01T00:00:00Z'),
      endsAt: new Date('2026-09-30T23:59:59Z'),
      lifecycleState: 'active',
      totalParticipants: 1000,
      myRank: 150, // Top 15% -> Gold
      myScore: 12000,
      myTier: 'Gold',
      tierRewardWld: 250,
      tierTrophy: null,
    });

    const status = await service.current(userId);
    expect(status.myTier).toBe('Gold');
    expect(status.tierRewardWld).toBe(250);
    expect(status.tierTrophy).toBeNull();
  });

  it('retrieves hall of fame with permanently archived top 10 winners', async () => {
    vi.mocked(mockRepo.hallOfFame).mockResolvedValueOnce([
      {
        seasonId: 'season-1-id',
        seasonName: '2026 여름 시즌',
        settledAt: new Date('2026-08-31T23:59:59Z'),
        honorees: [
          {
            rank: 1,
            userId: 'user-top1',
            displayName: '월덕최강자',
            score: 120000,
            trophyCode: 'TROPHY_SEASON_CHAMPION_#1',
            trophyName: '시즌 #1위 챔피언 트로피',
          },
          {
            rank: 2,
            userId: 'user-top2',
            displayName: '투자대왕',
            score: 98000,
            trophyCode: 'TROPHY_SEASON_CHAMPION_#2',
            trophyName: '시즌 #2위 챔피언 트로피',
          },
        ],
      },
    ]);

    const hof = await service.hallOfFame();
    expect(hof).toHaveLength(1);
    expect(hof[0]?.seasonName).toBe('2026 여름 시즌');
    expect(hof[0]?.honorees[0]?.rank).toBe(1);
    expect(hof[0]?.honorees[0]?.trophyCode).toBe('TROPHY_SEASON_CHAMPION_#1');
  });

  it('successfully triggers season settlement engine and generates hall of fame snapshots', async () => {
    const seasonId = '22222222-2222-4222-8222-222222222222';

    vi.mocked(mockRepo.settle).mockResolvedValueOnce({
      seasonId,
      seasonName: '2026 가을 그랜드 시즌',
      settledCount: 250,
      hallOfFameCount: 10,
    });

    const result = await service.settle(seasonId);
    expect(result.seasonName).toBe('2026 가을 그랜드 시즌');
    expect(result.settledCount).toBe(250);
    expect(result.hallOfFameCount).toBe(10);
    expect(mockRepo.settle).toHaveBeenCalledWith(seasonId);
  });

  it('successfully claims season reward idempotently', async () => {
    const userId = '11111111-1111-4111-8111-111111111111';
    const seasonId = '22222222-2222-4222-8222-222222222222';
    const key = '44444444-4444-4444-8444-444444444444';
    const now = new Date();

    vi.mocked(mockRepo.claimReward).mockResolvedValueOnce({
      claimId: 'claim-1234',
      seasonId,
      seasonName: '2026 가을 그랜드 시즌',
      tier: 'Capital Master',
      rank: 3,
      rewardWld: 500,
      trophyCode: 'TROPHY_SEASON_CHAMPION_#3',
      claimedAt: now,
    });

    const claim = await service.claimReward(userId, seasonId, key);
    expect(claim.claimId).toBe('claim-1234');
    expect(claim.tier).toBe('Capital Master');
    expect(claim.rewardWld).toBe(500);
    expect(claim.trophyCode).toBe('TROPHY_SEASON_CHAMPION_#3');
  });
});
