import { describe, expect, it, vi } from 'vitest';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const RECIPIENT = '22222222-2222-4222-8222-222222222222';
const OTHER = '33333333-3333-4333-8333-333333333333';
const KEY = '44444444-4444-4444-8444-444444444444';
const TX = '55555555-5555-4555-8555-555555555555';
const AMOUNT = '900719925474099312345678901234567890';

function posting(ownerUserId: string, direction: string, amount = AMOUNT) {
  return { ownerUserId, accountType: 'USER_CASH', direction, amount };
}
function row(postings: unknown = [posting(ACTOR, 'credit'), posting(RECIPIENT, 'debit')]) {
  return { transaction_id: TX, transaction_type: 'USER_TO_USER', postings };
}
function serviceFor(value: unknown) {
  return new WalletService({
    balancesForUser: async () => [],
    recentTransactionsForUser: async () => [],
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: TX }),
    claimDaily: async () => ({ transaction_id: TX, amount: '1', replayed: false }),
    transferReceiptByKey: async () => value,
  } as unknown as WalletRepositoryLike);
}

describe('wallet transfer receipt — durable owner-only evidence', () => {
  it('looks up by both the authenticated owner and original key, without mutation', async () => {
    const query = vi.fn(async (_sql: string, _params?: readonly unknown[]) => ({ rows: [row()] }));
    const repository = new PostgresWalletRepository({ query });
    const result = await repository.transferReceiptByKey(ACTOR, KEY);
    expect(result).toEqual(row());
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toMatch(/idempotency_key\s*=\s*\$1/i);
    expect(sql).toMatch(/actor_user_id\s*=\s*\$2/i);
    expect(sql).toMatch(/ledger_postings/i);
    expect(sql).not.toMatch(/\b(?:INSERT|UPDATE|DELETE)\b/i);
    expect(params).toEqual([KEY, ACTOR]);
  });

  it('returns unknown, not failed or safely retryable, when no committed receipt is visible', async () => {
    await expect(serviceFor(null).transferReceipt(ACTOR, KEY)).resolves.toEqual({ status: 'unknown' });
  });

  it('confirms an exact integer WLD transfer without Number conversion', async () => {
    await expect(serviceFor(row()).transferReceipt(ACTOR, KEY)).resolves.toEqual({
      status: 'committed', transactionId: TX, recipientUserId: RECIPIENT, amount: AMOUNT,
    });
  });

  it.each([
    ['wrong type', { ...row(), transaction_type: 'BANK_DEPOSIT' }],
    ['missing posting', row([posting(ACTOR, 'credit')])],
    ['wrong owner', row([posting(OTHER, 'credit'), posting(RECIPIENT, 'debit')])],
    ['wrong destination', row([posting(ACTOR, 'credit'), posting(ACTOR, 'debit')])],
    ['unbalanced amount', row([posting(ACTOR, 'credit'), posting(RECIPIENT, 'debit', '100')])],
    ['non-integer amount', row([posting(ACTOR, 'credit'), posting(RECIPIENT, 'debit', '1.5')])],
    ['extra posting', row([posting(ACTOR, 'credit'), posting(RECIPIENT, 'debit'), posting(OTHER, 'debit')])],
    ['missing ledger identity', { ...row(), transaction_id: null }],
  ])('fails closed on %s rather than returning a confirmed receipt', async (_case, invalid) => {
    await expect(serviceFor(invalid).transferReceipt(ACTOR, KEY)).rejects.toThrow();
  });

  it('rejects malformed keys before reading the ledger', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repository = new PostgresWalletRepository({ query });
    await expect(repository.transferReceiptByKey(ACTOR, 'invalid')).rejects.toThrow(/UUID/);
    expect(query).not.toHaveBeenCalled();
  });
});
