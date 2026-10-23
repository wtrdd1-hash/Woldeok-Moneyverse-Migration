import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import { WalletController } from './wallet.controller';
import type { RequestWithSession } from '../auth/session.context';
import { PostgresWalletRepository, requireWalletCategory } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';

const OWNER = '11111111-1111-4111-8111-111111111111';
const now = new Date('2026-10-24T00:00:00.000Z');

describe('owner-scoped wallet activity categories', () => {
  it('rejects unknown and injected categories before a query', () => {
    for (const value of ['bogus', 'transfer\' OR 1=1 --', '', ['bank'], 42]) {
      expect(() => requireWalletCategory(value)).toThrow(/category/);
    }
    expect(requireWalletCategory('bank')).toBe('bank');
    expect(requireWalletCategory(undefined)).toBeUndefined();
  });

  it('rejects invalid categories at the HTTP boundary and marks wallet data private', () => {
    const service = { overview: vi.fn() } as unknown as WalletService;
    const controller = new WalletController(service);
    expect(() => controller.overview({} as RequestWithSession, '20', 'transfer OR 1=1')).toThrow(BadRequestException);
    expect(service.overview).not.toHaveBeenCalled();
    const headers = Reflect.getMetadata(HEADERS_METADATA, WalletController.prototype.overview) as Array<{ name: string; value: string }>;
    expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
  });

  it('filters in SQL before the limit while keeping the actor bound', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresWalletRepository({ query } as never);
    await repo.recentTransactionsForUser(OWNER, 20, 'bank');
    const [sql, args] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toMatch(/account\.owner_user_id = \$1/);
    expect(sql).toMatch(/ledger_transaction\.type = ANY\(\$3::text\[\]\)/);
    expect(sql.indexOf('type = ANY')).toBeLessThan(sql.indexOf('LIMIT $2'));
    expect(args[0]).toBe(OWNER);
    expect(args[1]).toBe(20);
    expect(args[2]).toContain('BANK_DEPOSIT');
    expect(args[2]).toContain('BANK_WITHDRAW');
  });

  it('preserves the old unfiltered query and bound limit', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresWalletRepository({ query } as never);
    await repo.recentTransactionsForUser(OWNER, 50);
    const [sql, args] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).not.toContain('type = ANY');
    expect(args).toEqual([OWNER, 50]);
  });

  it('passes category to the repository and leaves wallet balances unfiltered', async () => {
    const recent = vi.fn(async () => []);
    const balances = vi.fn(async () => [
      { account_type: 'USER_CASH', available_amount: '9007199254740993123456789', updated_at: now },
      { account_type: 'USER_BANK', available_amount: '1', updated_at: now },
    ]);
    const repository = { balancesForUser: balances, recentTransactionsForUser: recent,
      activeRecipientById: async () => null, transfer: async () => ({ transactionId: OWNER }),
      claimDaily: async () => ({ transactionId: OWNER, amount: '1', replayed: false }),
    } as unknown as WalletRepositoryLike;
    const overview = await new WalletService(repository).overview(OWNER, { recentLimit: 20, category: 'reward' });
    expect(recent).toHaveBeenCalledWith(OWNER, 20, 'reward');
    expect(balances).toHaveBeenCalledWith(OWNER);
    expect(overview.balances.totalAvailableAmount).toBe('9007199254740993123456790');
  });
});
