import { describe, expect, it } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import type { MarketBroadcast } from '../stock/market-broadcast';

describe('wallet transfer notification: extreme WLD precision', () => {
  it('publishes exactly formatted transfer amounts beyond Number.MAX_SAFE_INTEGER', async () => {
    const actorUserId = '11111111-1111-4111-8111-111111111111';
    const recipientUserId = '22222222-2222-4222-8222-222222222222';
    const idempotencyKey = '33333333-3333-4333-8333-333333333333';
    const amount = '900719925474099312345678901234567890';
    const messages: string[] = [];
    const repository = {
      balancesForUser: async () => [],
      recentTransactionsForUser: async () => [],
      activeRecipientById: async (id: string) => ({ userId: id }),
      transfer: async () => ({ transactionId: idempotencyKey }),
      claimDaily: async () => ({ transactionId: idempotencyKey, amount: '1', replayed: false }),
    } as unknown as WalletRepositoryLike;
    const broadcast = {
      publishUserNotification: (_: string, event: { message: string }) => { messages.push(event.message); },
    } as unknown as MarketBroadcast;
    const service = new WalletService(repository, { broadcast });
    await service.transfer(actorUserId, { recipientUserId, idempotencyKey, amount });
    expect(messages).toHaveLength(2);
    expect(messages[0]).toContain('900,719,925,474,099,312,345,678,901,234,567,890 WLD');
    expect(messages[1]).toContain('900,719,925,474,099,312,345,678,901,234,567,890 WLD');
  });

  it('keeps 100-digit cash and bank balances exact through the API read model', async () => {
    const hugeCash = '9'.repeat(100);
    const bank = '1';
    const repository = {
      balancesForUser: async () => [
        { account_type: 'USER_CASH', available_amount: hugeCash, updated_at: new Date('2026-10-14T00:00:00Z') },
        { account_type: 'USER_BANK', available_amount: bank, updated_at: new Date('2026-10-14T00:00:00Z') },
      ],
      recentTransactionsForUser: async () => [],
      activeRecipientById: async () => null,
      transfer: async () => ({ transactionId: '33333333-3333-4333-8333-333333333333' }),
      claimDaily: async () => ({ transactionId: '33333333-3333-4333-8333-333333333333', amount: '1', replayed: false }),
    } as unknown as WalletRepositoryLike;
    const overview = await new WalletService(repository).overview('11111111-1111-4111-8111-111111111111');
    expect(overview.balances.cash.availableAmount).toBe(hugeCash);
    expect(overview.balances.bank.availableAmount).toBe(bank);
    expect(overview.balances.totalAvailableAmount).toBe('1' + '0'.repeat(100));
  });

});
