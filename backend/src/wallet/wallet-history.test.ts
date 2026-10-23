import { describe, expect, it, vi } from 'vitest';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';
import type { WalletRepositoryLike } from './wallet.service';

const OWNER = '11111111-1111-4111-8111-111111111111';
const ID = '22222222-2222-4222-8222-222222222222';
const row = (id: string) => ({
  transaction_id: id, type: 'USER_TO_USER', created_at: new Date('2026-10-23T12:00:00.000Z'),
  net_amount: '-900719925474099300000', cash_delta: '-900719925474099300000', bank_delta: '0',
});

function repositoryWithRows(rows: ReturnType<typeof row>[]) {
  const query = vi.fn().mockResolvedValue({ rows });
  const repository = new PostgresWalletRepository({ query } as never);
  return { query, repository };
}

describe('owner-scoped keyset wallet history', () => {
  it('reads a bounded page from the caller accounts, not all ledger rows', async () => {
    const { query, repository } = repositoryWithRows([row(ID)]);
    await repository.historyForUser(OWNER, 21);
    const [sql, args] = query.mock.calls[0]!;
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain('USER_CASH');
    expect(sql).toContain('USER_BANK');
    expect(sql).toContain('ORDER BY ledger_transaction.created_at DESC, ledger_transaction.id DESC');
    expect(sql).toContain('LIMIT $3');
    expect(args).toEqual([OWNER, null, 21]);
  });

  it('uses strict timestamp + id ordering to avoid duplicate or skipped same-time rows', async () => {
    const { query, repository } = repositoryWithRows([]);
    await repository.historyForUser(OWNER, 21, ID);
    const [sql, args] = query.mock.calls[0]!;
    expect(sql).toContain('anchor');
    expect(sql).toContain('ledger_transaction.id) <');
    expect(sql).toContain('account.owner_user_id = $1');
    expect(args).toEqual([OWNER, ID, 21]);
  });

  it('rejects invalid or partial cursors before SQL', async () => {
    const { query, repository } = repositoryWithRows([]);
    await expect(repository.historyForUser(OWNER, 21, 'bad')).rejects.toThrow();
    await expect(repository.historyForUser(OWNER, 21, '2026-10-23')).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });

  it('preserves 38-digit WLD and emits a cursor only when another row exists', async () => {
    const rows = Array.from({ length: 21 }, (_, i) => row(`22222222-2222-4222-8222-${String(i + 1).padStart(12, '0')}`));
    const { repository } = repositoryWithRows(rows);
    const service = new WalletService({
      balancesForUser: vi.fn(), recentTransactionsForUser: vi.fn(), activeRecipientById: vi.fn(),
      transfer: vi.fn(), claimDaily: vi.fn(), claimWork: vi.fn(),
      historyForUser: repository.historyForUser.bind(repository),
    } as unknown as WalletRepositoryLike);
    const result = await service.history(OWNER);
    expect(result.transactions).toHaveLength(20);
    expect(result.transactions[0]?.netAmount).toBe('-900719925474099300000');
    expect(result.nextCursor).toBe(rows[19]?.transaction_id);
  });
});
