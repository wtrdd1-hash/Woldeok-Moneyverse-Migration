import { describe, expect, it, vi } from 'vitest';
import { DopamineController } from './dopamine.controller';
import type { DopamineRepository } from './dopamine.repository';
import type { RequestWithSession } from '../auth/session.context';

const request = { session: { user_id: '11111111-1111-4111-8111-111111111111' } } as unknown as RequestWithSession;

describe('VIP chest ledger-backed award containment', () => {
  it('never invents Plus eligibility, a paid receipt or an available claim in the status API', async () => {
    const controller = new DopamineController(null);
    const status = await controller.getVipChestStatus(request);
    expect(status).toMatchObject({
      available: false, isPlusUser: null, claimedToday: null,
      rewardAmount: '0', diceAwarded: 0, nextAvailableAt: null,
      reason: 'unverified_entitlement_and_ledger_receipt',
    });
    expect(status).not.toHaveProperty('success', true);
  });

  it('rejects POST with HTTP 503 and never calls a repository without an atomic ledger receipt', async () => {
    const repository = { claimGoldenDuck: vi.fn(), query: vi.fn() } as unknown as DopamineRepository;
    const controller = new DopamineController(repository);
    await expect(controller.claimVipChest(request)).rejects.toMatchObject({
      status: 503,
    });
    expect(repository.claimGoldenDuck).not.toHaveBeenCalled();
    expect((repository as unknown as { query: ReturnType<typeof vi.fn> }).query).not.toHaveBeenCalled();
  });
});
