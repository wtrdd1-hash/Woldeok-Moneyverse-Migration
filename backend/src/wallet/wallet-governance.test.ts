import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import { WalletInputError } from './wallet.repository';
import { currentKstQuarter } from './wallet.service';

const actor = '11111111-1111-4111-8111-111111111111';
const current = currentKstQuarter();
const repoBase = {
  balancesForUser: async () => [],
  recentTransactionsForUser: async () => [],
  activeRecipientById: async () => null,
  transfer: async () => ({ transactionId: actor }),
  claimDaily: async () => ({ transactionId: actor, amount: '1', replayed: false }),
};
const service = (extra: Record<string, unknown>) => new WalletService({ ...repoBase, ...extra } as unknown as WalletRepositoryLike);

describe('verified citizen quarterly vote', () => {
  it('calculates the authoritative KST quarter across year and quarter boundaries', () => {
    expect(currentKstQuarter(new Date('2026-12-31T14:59:59Z'))).toBe('2026-Q4');
    expect(currentKstQuarter(new Date('2026-12-31T15:00:00Z'))).toBe('2027-Q1');
    expect(currentKstQuarter(new Date('2026-03-31T15:00:00Z'))).toBe('2026-Q2');
  });

  it.each(['WELFARE', 'INFRASTRUCTURE', 'CITIZEN_DIVIDEND', 'CURRENCY_STABILIZATION'])('accepts persisted %s', async (choice) => {
    const write = vi.fn(async (_actor: string, quarter: string, submitted: string) => ({ success: true, quarter, choice: submitted }));
    const result = await service({ voteCitizenBudget: write }).voteCitizenBudget(actor, current, choice);
    expect(result).toEqual({ success: true, quarter: current, choice });
    expect(write).toHaveBeenCalledWith(actor, current, choice);
  });

  it.each(['BUYBACK_BURN', 'INFRA', 'EMERGENCY', '', 'WELFARE;DROP'])('rejects invalid %s before DB', async (choice) => {
    const write = vi.fn();
    await expect(service({ voteCitizenBudget: write }).voteCitizenBudget(actor, current, choice)).rejects.toBeInstanceOf(WalletInputError);
    expect(write).not.toHaveBeenCalled();
  });

  it('rejects other quarters before DB', async () => {
    const write = vi.fn();
    await expect(service({ voteCitizenBudget: write }).voteCitizenBudget(actor, '2099-Q4', 'WELFARE')).rejects.toBeInstanceOf(WalletInputError);
    expect(write).not.toHaveBeenCalled();
  });

  it('never fabricates a vote when repository persistence is unavailable', async () => {
    await expect(service({}).voteCitizenBudget(actor, current, 'WELFARE')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('never confirms a rejected or inconsistent DB receipt', async () => {
    for (const result of [
      { success: false, quarter: current, choice: 'WELFARE' },
      { success: true, quarter: '2020-Q1', choice: 'WELFARE' },
      { success: true, quarter: current, choice: 'INFRASTRUCTURE' },
    ]) {
      await expect(service({ voteCitizenBudget: async () => result }).voteCitizenBudget(actor, current, 'WELFARE')).rejects.toBeInstanceOf(ServiceUnavailableException);
    }
  });
});
