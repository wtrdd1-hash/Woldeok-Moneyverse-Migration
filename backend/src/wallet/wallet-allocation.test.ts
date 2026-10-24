import { describe, expect, it, vi } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';

function serviceWith(cash: string, bank: string) {
  const balancesForUser = vi.fn(async () => [
    { account_type: 'USER_CASH', available_amount: cash, updated_at: new Date('2026-10-24T10:00:00Z') },
    { account_type: 'USER_BANK', available_amount: bank, updated_at: new Date('2026-10-24T10:01:00Z') },
  ]);
  const recentTransactionsForUser = vi.fn(async () => []);
  const repo = {
    balancesForUser,
    recentTransactionsForUser,
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: ACTOR }),
    claimDaily: async () => ({ transaction_id: ACTOR, amount: '1', replayed: false }),
  } as unknown as WalletRepositoryLike;
  return { service: new WalletService(repo), balancesForUser, recentTransactionsForUser };
}

describe('owner-scoped wallet allocation', () => {
  it('computes exact 100-digit cash/bank shares without converting balances to Number', async () => {
    const huge = '9'.repeat(100);
    const { service, balancesForUser, recentTransactionsForUser } = serviceWith(huge, '1');
    const result = await service.allocation(ACTOR);
    expect(result).toMatchObject({
      currency: 'WLD',
      cash: { availableAmount: huge, shareBps: '9999' },
      bank: { availableAmount: '1', shareBps: '1' },
      totalAvailableAmount: '1' + '0'.repeat(100),
    });
    expect(balancesForUser).toHaveBeenCalledExactlyOnceWith(ACTOR);
    expect(recentTransactionsForUser).not.toHaveBeenCalled();
  });

  it('reports zero shares rather than invented 50/50 when both pockets are empty', async () => {
    const { service } = serviceWith('0', '0');
    expect(await service.allocation(ACTOR)).toMatchObject({
      totalAvailableAmount: '0', cash: { shareBps: '0' }, bank: { shareBps: '0' },
    });
  });

  it('fails closed on negative or missing balances', async () => {
    await expect(serviceWith('-1', '5').service.allocation(ACTOR)).rejects.toThrow();
    const { service, balancesForUser } = serviceWith('5', '2');
    balancesForUser.mockResolvedValueOnce([]);
    await expect(service.allocation(ACTOR)).rejects.toThrow(/cash and bank wallets/);
  });

  it('rejects an untrusted user id before reading PostgreSQL', async () => {
    const { service, balancesForUser } = serviceWith('1', '2');
    await expect(service.allocation('not-a-uuid')).rejects.toThrow(/UUID/);
    expect(balancesForUser).not.toHaveBeenCalled();
  });
});
