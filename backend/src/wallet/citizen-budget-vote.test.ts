import { describe, expect, it, vi } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import { WalletInputError } from './wallet.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
function serviceWithVote(vote?: WalletRepositoryLike['voteCitizenBudget']) {
  const repo = {
    balancesForUser: async () => [], recentTransactionsForUser: async () => [],
    activeRecipientById: async () => null, transfer: async () => ({ transactionId: ACTOR }),
    claimDaily: async () => ({ transactionId: ACTOR, amount: '1', replayed: false }),
    ...(vote ? { voteCitizenBudget: vote } : {}),
  } as WalletRepositoryLike;
  return new WalletService(repo, { clock: () => new Date('2026-10-25T00:00:00Z') });
}

describe('authenticated citizen budget priority vote', () => {
  it('accepts only the real four DB choices and forwards the session actor', async () => {
    const vote = vi.fn(async (_actor: string, quarter: string, choice: string) => ({ success: true, quarter, choice }));
    const service = serviceWithVote(vote);
    for (const choice of ['WELFARE', 'INFRASTRUCTURE', 'CITIZEN_DIVIDEND', 'CURRENCY_STABILIZATION']) {
      await expect(service.voteCitizenBudget(ACTOR, '2026-Q4', choice)).resolves.toEqual({ success: true, quarter: '2026-Q4', choice });
    }
    expect(vote).toHaveBeenCalledTimes(4);
    expect(vote).toHaveBeenCalledWith(ACTOR, '2026-Q4', 'WELFARE');
  });
  it('rejects invented choices, past/future quarters, and invalid input before DB', async () => {
    const vote = vi.fn(async () => ({ success: true, quarter: '2026-Q4', choice: 'WELFARE' }));
    const service = serviceWithVote(vote);
    for (const choice of ['INFRA', 'BUYBACK_BURN', 'EMERGENCY', '']) {
      await expect(service.voteCitizenBudget(ACTOR, '2026-Q4', choice)).rejects.toBeInstanceOf(WalletInputError);
    }
    for (const quarter of ['2026-Q3', '2027-Q1', '2026-Q5', '2026-Q4\n']) {
      await expect(service.voteCitizenBudget(ACTOR, quarter, 'WELFARE')).rejects.toBeInstanceOf(WalletInputError);
    }
    expect(vote).not.toHaveBeenCalled();
  });
  it('never invents a successful vote when repository is absent or returns a false receipt', async () => {
    await expect(serviceWithVote().voteCitizenBudget(ACTOR, '2026-Q4', 'WELFARE')).rejects.toThrow();
    await expect(serviceWithVote(async () => ({ success: false, quarter: '2026-Q4', choice: 'WELFARE' }))
      .voteCitizenBudget(ACTOR, '2026-Q4', 'WELFARE')).rejects.toThrow();
  });
});
