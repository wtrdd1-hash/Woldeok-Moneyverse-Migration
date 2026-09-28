import { describe, expect, it, vi } from 'vitest';
import { DopamineController } from './dopamine.controller';
import type { DopamineRepository } from './dopamine.repository';
import type { RequestWithSession } from '../auth/session.context';

describe('DopamineController - Golden Duck Fever', () => {
  const mockUserId = '11111111-2222-4333-8444-555555555555';
  const mockRequest = {
    session: {
      userId: mockUserId,
    },
  } as unknown as RequestWithSession;

  it('calculates reward within 5,000 WLD bounds without repository', async () => {
    const controller = new DopamineController(null);

    const result = await controller.claimGoldenDuck(mockRequest, {
      clickCount: 50,
      comboMultiplier: 2.0,
    });

    expect(result.success).toBe(true);
    expect(result.userId).toBe(mockUserId);
    expect(result.clicks).toBe(50);
    expect(result.multiplier).toBe(2.0);
    expect(result.rewardAmount).toBe(2500); // 50 * 25 * 2.0 = 2500
  });

  it('caps reward at 5,000 WLD maximum', async () => {
    const controller = new DopamineController(null);

    const result = await controller.claimGoldenDuck(mockRequest, {
      clickCount: 200,
      comboMultiplier: 3.0,
    });

    expect(result.rewardAmount).toBe(5000); // capped at 5000
    expect(result.clicks).toBe(200);
    expect(result.multiplier).toBe(3.0);
  });

  it('delegates to DopamineRepository when injected', async () => {
    const mockRepo: DopamineRepository = {
      claimGoldenDuck: vi.fn().mockResolvedValue({
        success: true,
        userId: mockUserId,
        transactionId: 'tx-1234',
        rewardAmount: 3750,
        newBalance: '50000',
        clicks: 50,
        multiplier: 3.0,
        claimedAt: '2026-09-28T00:00:00.000Z',
      }),
    } as unknown as DopamineRepository;

    const controller = new DopamineController(mockRepo);

    const result = await controller.claimGoldenDuck(mockRequest, {
      clickCount: 50,
      comboMultiplier: 3.0,
      idempotencyKey: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
    });

    expect(mockRepo.claimGoldenDuck).toHaveBeenCalledWith({
      actorUserId: mockUserId,
      idempotencyKey: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d',
      clickCount: 50,
      comboMultiplier: 3.0,
    });
    expect(result.rewardAmount).toBe(3750);
    expect(result.newBalance).toBe('50000');
  });
});
