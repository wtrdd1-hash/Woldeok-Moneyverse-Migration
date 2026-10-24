import { describe, expect, it } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import type { WalletTransactionRow } from './wallet.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const HUGE = '90071992547409931234567890123456789012';
const tx = (id: string, date: string, net: string, cash: string, bank: string): WalletTransactionRow => ({
  transaction_id: id, type: 'BANK_DEPOSIT', created_at: new Date(date),
  net_amount: net, cash_delta: cash, bank_delta: bank,
});
function mockRepo(rows: WalletTransactionRow[]) {
  const calls: { actor: string; limit: number }[] = [];
  const repository = {
    balancesForUser: async () => [],
    recentTransactionsForUser: async (actor: string, limit: number) => {
      calls.push({ actor, limit });
      return rows;
    },
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: ACTOR }),
    claimDaily: async () => ({ transactionId: ACTOR, amount: '1', replayed: false }),
  } as WalletRepositoryLike;
  return { service: new WalletService(repository), calls };
}

describe('owner-scoped latest-50 UTC daily WLD activity', () => {
  it('groups by UTC date, preserves exact integer strings and counts zero-net pocket moves', async () => {
    const { service, calls } = mockRepo([
      tx('11111111-1111-4111-8111-111111111112', '2026-10-24T23:30:00Z', HUGE, HUGE, '0'),
      tx('11111111-1111-4111-8111-111111111113', '2026-10-24T01:00:00Z', '0', '-2500', '2500'),
      tx('11111111-1111-4111-8111-111111111114', '2026-10-24T00:01:00Z', '-5', '-5', '0'),
      tx('11111111-1111-4111-8111-111111111115', '2026-10-23T23:59:00Z', '3', '3', '0'),
    ]);
    const result = await service.dailyActivity(ACTOR);
    expect(calls).toEqual([{ actor: ACTOR, limit: 50 }]);
    expect(result).toEqual({
      scope: 'latest-50', inspectedTransactions: 4,
      days: [
        { date: '2026-10-24', transactionCount: 3, incomingAmount: HUGE, outgoingAmount: '5', netAmount: (BigInt(HUGE) - 5n).toString(), internalTransferCount: 1 },
        { date: '2026-10-23', transactionCount: 1, incomingAmount: '3', outgoingAmount: '0', netAmount: '3', internalTransferCount: 0 },
      ],
    });
  });
  it('returns empty verified sample and never accepts caller-selected owner', async () => {
    const { service, calls } = mockRepo([]);
    expect(await service.dailyActivity(ACTOR)).toEqual({ scope: 'latest-50', inspectedTransactions: 0, days: [] });
    expect(calls[0]?.actor).toBe(ACTOR);
    await expect(service.dailyActivity('invalid')).rejects.toThrow(/UUID/i);
    expect(calls).toHaveLength(1);
    expect(OTHER).not.toBe(ACTOR);
  });
  it('fails on contradictory pocket amounts instead of fabricating totals', async () => {
    const { service } = mockRepo([tx(ACTOR, '2026-10-24T12:00:00Z', '0', '-2500', '2499')]);
    await expect(service.dailyActivity(ACTOR)).rejects.toThrow(/mismatch/i);
  });
});
