import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import { WalletController } from './wallet.controller';
import type { RequestWithSession } from '../auth/session.context';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const timestamp = new Date('2026-10-24T00:00:00Z');
const minimalMethods = {
  activeRecipientById: async () => null,
  transfer: async () => ({ transactionId: ACTOR }),
  claimDaily: async () => ({ transaction_id: ACTOR, amount: '1', replayed: false }),
};
const balanceRows = [
  { account_type: 'USER_CASH', available_amount: '10', updated_at: timestamp },
  { account_type: 'USER_BANK', available_amount: '20', updated_at: timestamp },
];

describe('owner-scoped wallet activity direction filter', () => {
  it('rejects an unknown direction before any repository access', async () => {
    const recentTransactionsForUser = vi.fn(async () => []);
    const repository = { ...minimalMethods, balancesForUser: vi.fn(async () => balanceRows), recentTransactionsForUser } as unknown as WalletRepositoryLike;
    const service = new WalletService(repository);
    await expect(service.overview(ACTOR, { direction: 'anything' })).rejects.toThrow(/direction/i);
    expect(recentTransactionsForUser).not.toHaveBeenCalled();
    expect(repository.balancesForUser).not.toHaveBeenCalled();
  });

  it.each(['in', 'out', 'neutral'] as const)('passes valid %s to owner repository before normalization', async (direction) => {
    const recentTransactionsForUser = vi.fn(async () => []);
    const repository = { ...minimalMethods, balancesForUser: async () => balanceRows, recentTransactionsForUser } as unknown as WalletRepositoryLike;
    await new WalletService(repository).overview(ACTOR, { recentLimit: 20, direction });
    expect(recentTransactionsForUser).toHaveBeenCalledWith(ACTOR, 20, direction);
  });

  it('validates query at controller boundary, and does not trust client-supplied owner', () => {
    const overview = vi.fn();
    const controller = new WalletController({ overview } as unknown as WalletService);
    const request = { session: { user_id: ACTOR } } as RequestWithSession;
    expect(() => controller.overview(request, '20', 'garbage')).toThrow(BadRequestException);
    expect(overview).not.toHaveBeenCalled();
    controller.overview(request, '20', 'in');
    expect(overview).toHaveBeenCalledWith(ACTOR, { recentLimit: 20, direction: 'in' });
  });

  it('filters owner aggregates in SQL before LIMIT, with bound direction and stable ordering', async () => {
    const query = vi.fn(async () => ({ rows: [], rowCount: 0 }));
    const repo = new PostgresWalletRepository({ query } as never);
    await repo.recentTransactionsForUser(ACTOR, 20, 'neutral');
    expect(query).toHaveBeenCalledOnce();
    const [sql, args] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(args).toEqual([ACTOR, 20, 'neutral']);
    expect(sql).toMatch(/account\.owner_user_id\s*=\s*\$1/);
    expect(sql).toMatch(/GROUP BY[\s\S]*WHERE[\s\S]*net_amount[\s\S]*LIMIT \$2/i);
    expect(sql).toMatch(/ORDER BY[\s\S]*created_at DESC[\s\S]*transaction_id DESC/i);
    expect(sql).not.toContain('${');
  });
});
