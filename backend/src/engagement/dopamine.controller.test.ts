import { describe, expect, it, vi } from 'vitest';
import { DopamineController } from './dopamine.controller';
import type { DopamineRepository } from './dopamine.repository';
import type { RequestWithSession } from '../auth/session.context';

describe('DopamineController - Golden Duck ledger integrity', () => {
  const request = { session: { user_id: '11111111-2222-4333-8444-555555555555' } } as unknown as RequestWithSession;

  it('never issues a reward receipt when the repository is missing', async () => {
    const controller = new DopamineController(null);
    await expect(controller.claimGoldenDuck(request, { clickCount: 50, comboMultiplier: 2, idempotencyKey: '11111111-2222-4333-8444-555555555555' })).rejects.toMatchObject({ status: 503 });
  });

  it('never calls the old non-atomic mint path even when a repository exists', async () => {
    const repo = { claimGoldenDuck: vi.fn() } as unknown as DopamineRepository;
    const controller = new DopamineController(repo);
    await expect(controller.claimGoldenDuck(request, { clickCount: 200, comboMultiplier: 2 })).rejects.toMatchObject({ status: 503 });
    expect(repo.claimGoldenDuck).not.toHaveBeenCalled();
  });

  it('reads owner-scoped committed ledger status, never invents eligibility', async () => {
    const repo = { goldenDuckLedgerStatus: vi.fn().mockResolvedValue({ claimedToday: true, transactionId: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d' }) } as unknown as DopamineRepository;
    const controller = new DopamineController(repo);
    const status = await controller.getGoldenDuckLedgerStatus(request);
    expect(repo.goldenDuckLedgerStatus).toHaveBeenCalledWith(request.session?.user_id);
    expect(status).toMatchObject({ claimedToday: true, rewardClaimsEnabled: false, transactionId: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d' });
  });

  it('fails closed on missing DB or read error, not a fabricated no-claims status', async () => {
    await expect(new DopamineController(null).getGoldenDuckLedgerStatus(request)).rejects.toMatchObject({ status: 503 });
    const repo = { goldenDuckLedgerStatus: vi.fn().mockRejectedValue(new Error('db down')) } as unknown as DopamineRepository;
    await expect(new DopamineController(repo).getGoldenDuckLedgerStatus(request)).rejects.toMatchObject({ status: 503 });
  });
});
