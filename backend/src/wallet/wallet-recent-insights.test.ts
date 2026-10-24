import { describe, expect, it } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import type { WalletTransactionRow } from './wallet.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const HUGE = '9'.repeat(38);
function row(id: number, net: string, cash = net, bank = '0'): WalletTransactionRow {
  return {
    transaction_id: `00000000-0000-4000-8000-${String(id).padStart(12, '0')}`,
    type: 'USER_TO_USER',
    created_at: new Date('2026-10-24T01:00:00.000Z'),
    net_amount: net,
    cash_delta: cash,
    bank_delta: bank,
  };
}
function service(rows: WalletTransactionRow[], capture: string[] = []) {
  const repository = {
    balancesForUser: async () => [
      { account_type: 'USER_CASH', available_amount: '1', updated_at: new Date() },
      { account_type: 'USER_BANK', available_amount: '2', updated_at: new Date() },
    ],
    recentTransactionsForUser: async (actor: string, limit: number) => {
      capture.push(`${actor}:${limit}`);
      return rows.slice(0, limit);
    },
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: '00000000-0000-4000-8000-000000000001' }),
    claimDaily: async () => ({ transactionId: '00000000-0000-4000-8000-000000000001', amount: '1', replayed: false }),
  } as unknown as WalletRepositoryLike;
  return new WalletService(repository);
}

describe('recent wallet activity insights (owner-scoped read model)', () => {
  it('computes exact income/outgo/net without treating neutral pocket movements as income', async () => {
    const calls: string[] = [];
    const overview = await service([
      row(1, HUGE),
      row(2, '-25'),
      row(3, '0', '-2500', '2500'),
      row(4, '5'),
    ], calls).overview(ACTOR, { recentLimit: 50 });
    expect(calls).toEqual([`${ACTOR}:50`]);
    expect(overview.recentInsights).toEqual({
      scope: 'recent', requestedLimit: 50, sampledCount: 4,
      incomingAmount: (BigInt(HUGE) + 5n).toString(),
      outgoingAmount: '25',
      netAmount: (BigInt(HUGE) - 20n).toString(),
      neutralCount: 1,
    });
  });

  it('does not claim an empty or full 50-row sample is complete history', async () => {
    expect((await service([]).overview(ACTOR, { recentLimit: 50 })).recentInsights).toMatchObject({
      scope: 'recent', requestedLimit: 50, sampledCount: 0,
      incomingAmount: '0', outgoingAmount: '0', netAmount: '0', neutralCount: 0,
    });
    expect((await service(Array.from({ length: 60 }, (_, i) => row(i + 1, '1'))).overview(ACTOR, { recentLimit: 50 })).recentInsights).toMatchObject({
      requestedLimit: 50, sampledCount: 50, incomingAmount: '50',
    });
  });

  it('rejects corrupted ledger pocket deltas rather than returning misleading totals', async () => {
    await expect(service([row(1, '2', '1', '0')]).overview(ACTOR)).rejects.toThrow(/pocket delta mismatch/);
  });
});
