import { describe, expect, it, vi } from 'vitest';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const OWNER = '11111111-1111-4111-8111-111111111111';
const OTHER = '33333333-3333-4333-8333-333333333333';
const ID = '22222222-2222-4222-8222-222222222222';
const HUGE = '90071992547409931234567890123456789012';
const row = {
  transaction_id: ID, type: 'BANK_DEPOSIT', created_at: new Date('2026-09-01T00:00:00Z'),
  net_amount: '0', cash_delta: '-' + HUGE, bank_delta: HUGE,
};

function fake(receipt: typeof row | null) {
  const transactionForUser = vi.fn(async (owner: string, reference: string) =>
    owner === OWNER && reference === ID ? receipt : null);
  const repo = {
    balancesForUser: async () => [], recentTransactionsForUser: async () => [],
    activeRecipientById: async () => null, transfer: async () => ({ transactionId: ID }),
    claimDaily: async () => ({ transaction_id: ID, amount: '1', replayed: false }),
    transactionForUser,
  } as unknown as WalletRepositoryLike;
  return { service: new WalletService(repo), transactionForUser };
}

describe('owner-scoped historical WLD receipt', () => {
  it('retrieves a committed older transaction with exact 38-digit signed pockets', async () => {
    const { service, transactionForUser } = fake(row);
    const receipt = await service.historicalReceiptForUser(OWNER, ID);
    expect(transactionForUser).toHaveBeenCalledWith(OWNER, ID);
    expect(receipt).toMatchObject({
      transactionId: ID, state: 'CONFIRMED', historyScope: 'ALL_POSTED',
      netAmount: '0', cashDelta: '-' + HUGE, bankDelta: HUGE, direction: 'neutral',
    });
  });

  it('does not disclose foreign or nonexistent transactions', async () => {
    const { service } = fake(row);
    await expect(service.historicalReceiptForUser(OTHER, ID)).resolves.toBeNull();
    await expect(service.historicalReceiptForUser(OWNER, OTHER)).resolves.toBeNull();
  });

  it('rejects invalid IDs before querying and inconsistent pocket sums', async () => {
    const { service, transactionForUser } = fake(row);
    await expect(service.historicalReceiptForUser(OWNER, 'not-uuid')).rejects.toThrow(/UUID/);
    expect(transactionForUser).not.toHaveBeenCalled();
    await expect(fake({ ...row, net_amount: '1' }).service.historicalReceiptForUser(OWNER, ID))
      .rejects.toThrow(/mismatch/);
  });

  it('rejects a mismatched database reference rather than returning a false receipt', async () => {
    const { service } = fake({ ...row, transaction_id: OTHER });
    await expect(service.historicalReceiptForUser(OWNER, ID)).rejects.toThrow(/reference mismatch/);
  });

  it('parameterizes the owner and reference in a read-only PostgreSQL query', async () => {
    const query = vi.fn(async (_sql: string, _params: unknown[]) => ({ rows: [row], rowCount: 1 }));
    const repo = new PostgresWalletRepository({ query } as never);
    await expect(repo.transactionForUser(OWNER, ID)).resolves.toMatchObject({ transaction_id: ID });
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.ledger_postings');
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain('ledger_transaction.id = $2');
    expect(sql).not.toMatch(/INSERT|UPDATE|DELETE/i);
    expect(params).toEqual([OWNER, ID]);
  });
});
