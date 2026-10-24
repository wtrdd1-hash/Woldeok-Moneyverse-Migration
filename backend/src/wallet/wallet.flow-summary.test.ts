import { describe, expect, it } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import type { WalletTransactionRow } from './wallet.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const TX = '22222222-2222-4222-8222-222222222222';
const now = new Date('2026-10-24T15:00:00.000Z');
const row = (net: string, cash: string, bank: string): WalletTransactionRow => ({
  transaction_id: TX, type: 'USER_TO_USER', created_at: now,
  net_amount: net, cash_delta: cash, bank_delta: bank,
});
function makeService(rows: WalletTransactionRow[], seen: { user?: string; limit?: number } = {}) {
  const repo = {
    balancesForUser: async () => [],
    recentTransactionsForUser: async (user: string, limit: number) => {
      seen.user = user; seen.limit = limit; return rows;
    },
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: TX }),
    claimDaily: async () => ({ transactionId: TX, amount: '1', replayed: false }),
  } as unknown as WalletRepositoryLike;
  return new WalletService(repo);
}

describe('owner-only recent wallet cash-flow snapshot', () => {
  it('counts signed external flows exactly and excludes cash-bank moves', async () => {
    const huge = '900719925474099312345678901234567890';
    const seen: { user?: string; limit?: number } = {};
    const result = await makeService([
      row(huge, huge, '0'),
      row('-2', '-2', '0'),
      row('0', '-10', '10'),
      row('0', '0', '0'),
    ], seen).flowSummary(ACTOR);
    expect(seen).toEqual({ user: ACTOR, limit: 50 });
    expect(result).toMatchObject({
      currency: 'WLD', scope: 'recent_50', completeHistory: false, transactionCount: 4,
      incomingCount: 1, outgoingCount: 1, internalMovementCount: 1,
      incomingAmount: huge, outgoingAmount: '2',
      netAmount: (BigInt(huge) - 2n).toString(),
    });
  });

  it('reports empty verified history without pretending it is all-time', async () => {
    const result = await makeService([]).flowSummary(ACTOR);
    expect(result).toMatchObject({ transactionCount: 0, incomingAmount: '0', outgoingAmount: '0', netAmount: '0', completeHistory: false });
  });

  it('rejects corrupt owner ledger pocket projections instead of displaying a fabricated sum', async () => {
    await expect(makeService([row('100', '40', '40')]).flowSummary(ACTOR)).rejects.toThrow(/pocket delta mismatch/);
  });

  it('refuses incomplete pocket projection even if the net amount looks valid', async () => {
    const partial = { ...row('0', '0', '0'), bank_delta: undefined };
    await expect(makeService([partial]).flowSummary(ACTOR)).rejects.toThrow(/missing pocket amount/);
  });

  it('propagates authoritative database read failure', async () => {
    const service = makeService([]);
    service.repository.recentTransactionsForUser = async () => { throw new Error('database unavailable'); };
    await expect(service.flowSummary(ACTOR)).rejects.toThrow('database unavailable');
  });
});
