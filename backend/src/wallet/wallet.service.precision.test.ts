import { describe, expect, it, vi } from 'vitest';
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

  it('uses the durable ledger transaction ID for replayed transfer push identities', async () => {
    const actor = '11111111-1111-4111-8111-111111111111';
    const recipient = '22222222-2222-4222-8222-222222222222';
    const key = '33333333-3333-4333-8333-333333333333';
    const transactionId = '44444444-4444-4444-8444-444444444444';
    const notifications: { userId: string; id: string }[] = [];
    const repository = {
      balancesForUser: async () => [],
      recentTransactionsForUser: async () => [],
      activeRecipientById: async (id: string) => ({ userId: id }),
      transfer: async () => ({ transactionId }),
      claimDaily: async () => ({ transactionId, amount: '1', replayed: false }),
    } as unknown as WalletRepositoryLike;
    const broadcast = {
      publishUserNotification: (userId: string, event: { id: string }) => {
        notifications.push({ userId, id: event.id });
      },
    } as unknown as MarketBroadcast;
    const service = new WalletService(repository, { broadcast });
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-10-29T00:00:00Z'));
      await service.transfer(actor, { recipientUserId: recipient, amount: '100', idempotencyKey: key });
      vi.setSystemTime(new Date('2026-10-29T00:01:00Z'));
      await service.transfer(actor, { recipientUserId: recipient, amount: '100', idempotencyKey: key });
      expect(notifications).toHaveLength(4);
      expect(notifications[0]?.id).toBe(`notif_recv_${transactionId}`);
      expect(notifications[1]?.id).toBe(`notif_send_${transactionId}`);
      expect(notifications[2]?.id).toBe(notifications[0]?.id);
      expect(notifications[3]?.id).toBe(notifications[1]?.id);
    } finally {
      vi.useRealTimers();
    }
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
