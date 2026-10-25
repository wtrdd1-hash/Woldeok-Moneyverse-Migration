import { describe, expect, it } from 'vitest';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const OWNER = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '22222222-2222-4222-8222-222222222222';
const TX = '33333333-3333-4333-8333-333333333333';
const BIG = '900719925474099312345678901234567890';

function setup(ownerRows: Array<Record<string, unknown>>) {
  const queries: Array<[string, number]> = [];
  const repository = {
    balancesForUser: async () => { throw new Error('receipt must not fetch balances'); },
    recentTransactionsForUser: async (userId: string, limit: number) => {
      queries.push([userId, limit]);
      return userId === OWNER ? ownerRows : [];
    },
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: TX }),
    claimDaily: async () => ({ transactionId: TX, amount: '1', replayed: false }),
  } as unknown as WalletRepositoryLike;
  return { service: new WalletService(repository), queries };
}

describe('recent owner-only wallet transaction receipt', () => {
  it('returns a confirmed ledger receipt with exact signed cash, bank and net movements', async () => {
    const { service, queries } = setup([{
      transaction_id: TX,
      type: 'BANK_DEPOSIT',
      created_at: new Date('2026-10-25T00:00:00.000Z'),
      net_amount: '0',
      cash_delta: `-${BIG}`,
      bank_delta: BIG,
    }]);
    await expect(service.recentTransactionReceipt(OWNER, TX)).resolves.toMatchObject({
      scope: 'recent_50',
      receipt: { transactionId: TX, netAmount: '0', cashDelta: `-${BIG}`, bankDelta: BIG, direction: 'neutral' },
    });
    expect(queries).toEqual([[OWNER, 50]]);
  });

  it('does not reveal another member transaction or fetch a larger history', async () => {
    const { service, queries } = setup([{ transaction_id: TX, type: 'USER_TO_USER', created_at: new Date(), net_amount: '-5', cash_delta: '-5', bank_delta: '0' }]);
    await expect(service.recentTransactionReceipt(FOREIGN, TX)).resolves.toBeNull();
    await expect(service.recentTransactionReceipt(OWNER, '44444444-4444-4444-8444-444444444444')).resolves.toBeNull();
    expect(queries).toEqual([[FOREIGN, 50], [OWNER, 50]]);
  });

  it('fails closed rather than confirming a receipt with missing pocket provenance', async () => {
    const { service } = setup([{
      transaction_id: TX, type: 'BANK_DEPOSIT', created_at: new Date(), net_amount: '0',
    }]);
    await expect(service.recentTransactionReceipt(OWNER, TX)).rejects.toThrow(/pocket/i);
  });

  it('rejects malformed identifiers before any SQL', async () => {
    const { service, queries } = setup([]);
    await expect(service.recentTransactionReceipt(OWNER, '../other')).rejects.toThrow(/UUID/);
    expect(queries).toHaveLength(0);
  });
});
