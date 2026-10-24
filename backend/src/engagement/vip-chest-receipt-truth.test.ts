import { describe, expect, it, vi } from 'vitest';
import { DopamineController } from './dopamine.controller';
import type { DopamineRepository } from './dopamine.repository';
import type { RequestWithSession } from '../auth/session.context';

const request = {
  session: { user_id: '11111111-2222-4333-8444-555555555555' },
} as unknown as RequestWithSession;

describe('VIP chest ledger receipt truth', () => {
  it('does not assert Plus membership, cooldown or rewards without authoritative database evidence', async () => {
    const result = await new DopamineController(null).getVipChestStatus(request);
    expect(result).toMatchObject({
      available: false,
      isPlusUser: null,
      claimedToday: null,
      rewardAmount: '0',
      diceAwarded: 0,
    });
    expect(result).not.toHaveProperty('nextAvailableAt');
  });

  it('never returns a successful reward receipt without an atomic ledger posting', async () => {
    const repository = { claimGoldenDuck: vi.fn() } as unknown as DopamineRepository;
    const controller = new DopamineController(repository);
    await expect(controller.claimVipChest(request)).rejects.toMatchObject({ status: 503 });
    expect(repository.claimGoldenDuck).not.toHaveBeenCalled();
  });
});
