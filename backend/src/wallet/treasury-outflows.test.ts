import { describe, expect, it, vi } from 'vitest';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import { WalletController } from './wallet.controller';
import type { RequestWithSession } from '../auth/session.context';
import { ServiceUnavailableException } from '@nestjs/common';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

function repoMock(row: Record<string, unknown>) {
  return {
    balancesForUser: async () => [], recentTransactionsForUser: async () => [],
    activeRecipientById: async () => null, transfer: async () => ({ transactionId: ACTOR }),
    claimDaily: async () => ({ transactionId: ACTOR, amount: '1', replayed: false }),
    treasuryOutflowsForUser: vi.fn(async () => row),
  } as unknown as WalletRepositoryLike & { treasuryOutflowsForUser: ReturnType<typeof vi.fn> };
}

describe('verified treasury ledger outflow', () => {
  it('queries only owner cash/bank credit postings for actual USER_TO_TREASURY transactions', async () => {
    const query = vi.fn(async () => ({ rows: [{ total_amount: '900719925474099312345678901234567890', transaction_count: '1', last_occurred_at: new Date('2026-10-24T01:00:00Z') }] }));
    const repository = new PostgresWalletRepository({ query } as never);
    const row = await repository.treasuryOutflowsForUser(ACTOR);
    expect(row?.total_amount).toBe('900719925474099312345678901234567890');
    const [sql, args] = query.mock.calls[0]! as unknown as [string, string[]];
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain("'USER_TO_TREASURY'");
    expect(sql).toContain("'credit'::public.posting_direction");
    expect(sql).not.toMatch(/INSERT|UPDATE|DELETE/);
    expect(args).toEqual([ACTOR]);
  });

  it('returns exact non-estimated amount and owner scope, without other member data', async () => {
    const repository = repoMock({ total_amount: '9'.repeat(100), transaction_count: '123', last_occurred_at: new Date('2026-10-24T01:00:00Z') });
    const result = await new WalletService(repository).treasuryOutflows(ACTOR);
    expect(repository.treasuryOutflowsForUser).toHaveBeenCalledWith(ACTOR);
    expect(result).toEqual({ source: 'posted_owner_ledger', transactionType: 'USER_TO_TREASURY', currency: 'WLD', totalOutflowAmount: '9'.repeat(100), transactionCount: '123', lastOccurredAt: '2026-10-24T01:00:00.000Z', isTaxTotal: false });
    expect(JSON.stringify(result)).not.toContain('userId');
  });

  it('returns an honest zero when no matching owner ledger posting exists', async () => {
    const result = await new WalletService(repoMock({ total_amount: '0', transaction_count: '0', last_occurred_at: null })).treasuryOutflows(ACTOR);
    expect(result).toMatchObject({ totalOutflowAmount: '0', transactionCount: '0', lastOccurredAt: null, isTaxTotal: false });
  });

  it('fails closed for malformed database numbers and unavailable repository', async () => {
    await expect(new WalletService(repoMock({ total_amount: '1e6', transaction_count: '1', last_occurred_at: null })).treasuryOutflows(ACTOR)).rejects.toThrow();
    await expect(new WalletService(repoMock({ total_amount: '0', transaction_count: '-1', last_occurred_at: null })).treasuryOutflows(ACTOR)).rejects.toThrow();
    const repo = repoMock({ total_amount: '0', transaction_count: '0', last_occurred_at: null });
    delete (repo as Record<string, unknown>).treasuryOutflowsForUser;
    await expect(new WalletService(repo).treasuryOutflows(ACTOR)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('controller takes actor from session and marks both endpoints private', async () => {
    const treasuryOutflows = vi.fn(async () => ({ source: 'posted_owner_ledger' }));
    const controller = new WalletController({ treasuryOutflows } as unknown as WalletService);
    await expect(controller.treasuryOutflows(request)).resolves.toMatchObject({ source: 'posted_owner_ledger' });
    expect(treasuryOutflows).toHaveBeenCalledWith(ACTOR);
    const headers = Reflect.getMetadata('__headers__', WalletController.prototype.treasuryOutflows);
    expect(headers).toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Cache-Control', value: 'private, no-store' })]));
    expect(() => controller.getTaxReceipt(request)).toThrow(ServiceUnavailableException);
  });
});
