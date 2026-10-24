import { describe, expect, it, vi } from 'vitest';
import { WalletController } from './wallet.controller';
import { BadRequestException } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { BadRequestException } from '@nestjs/common';
import { WalletService, type WalletRepositoryLike } from './wallet.service';
import { WalletInputError } from './wallet.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const TX = '22222222-2222-4222-8222-222222222222';
const date = new Date('2026-10-24T00:00:00Z');
function repository() {
  const rows = ['WORK_REWARD', 'USER_TO_USER', 'BANK_DEPOSIT', 'SHOP_PURCHASE', 'VIRTUAL_STOCK_BUY', 'UNRECOGNIZED_EVENT'].map((type, i) => ({
    transaction_id: TX, type, created_at: date, net_amount: i === 2 ? '0' : '90071992547409931234567890',
    cash_delta: i === 2 ? '-2500' : '90071992547409931234567890',
    bank_delta: i === 2 ? '2500' : '0',
  }));
  const recentTransactionsForUser = vi.fn(async (_actor: string, _limit: number) => rows);
  const repo = {
    balancesForUser: async () => [
      { account_type: 'USER_CASH', available_amount: '1', updated_at: date },
      { account_type: 'USER_BANK', available_amount: '2', updated_at: date },
    ],
    recentTransactionsForUser,
    activeRecipientById: async () => null,
    transfer: async () => ({ transactionId: TX }),
    claimDaily: async () => ({ transactionId: TX, amount: '1', replayed: false }),
  } as unknown as WalletRepositoryLike;
  return { service: new WalletService(repo), recentTransactionsForUser };
}

describe('wallet recent activity categories', () => {
  it.each([
    ['rewards', 'WORK_REWARD'],
    ['transfers', 'USER_TO_USER'],
    ['banking', 'BANK_DEPOSIT'],
    ['purchases', 'SHOP_PURCHASE'],
    ['markets', 'VIRTUAL_STOCK_BUY'],
    ['other', 'UNRECOGNIZED_EVENT'],
  ] as const)('filters %s without changing WLD or owner scope', async (category, expected) => {
    const { service, recentTransactionsForUser } = repository();
    const overview = await service.overview(ACTOR, { recentLimit: 50, category });
    expect(overview.recentTransactions.map((entry) => entry.type)).toEqual([expected]);
    expect(recentTransactionsForUser).toHaveBeenCalledWith(ACTOR, 50);
    if (category === 'banking') {
      expect(overview.recentTransactions[0]).toMatchObject({ netAmount: '0', cashDelta: '-2500', bankDelta: '2500' });
    } else {
      expect(overview.recentTransactions[0]?.netAmount).toBe('90071992547409931234567890');
    }
  });
  it('keeps unfiltered behavior and does not query beyond the requested recent window', async () => {
    const { service, recentTransactionsForUser } = repository();
    const result = await service.overview(ACTOR, { recentLimit: 50 });
    expect(result.recentTransactions).toHaveLength(6);
    expect(recentTransactionsForUser).toHaveBeenCalledOnce();
    expect(recentTransactionsForUser).toHaveBeenCalledWith(ACTOR, 50);
  });
  it('rejects unknown category before querying any member ledger', async () => {
    const { service, recentTransactionsForUser } = repository();
    await expect(service.overview(ACTOR, { category: 'all;DROP TABLE' as 'all' })).rejects.toBeInstanceOf(WalletInputError);
    expect(recentTransactionsForUser).not.toHaveBeenCalled();
  });
});

describe('wallet category HTTP validation', () => {
  it('returns 400 for invalid category without reading session or repository', () => {
    const controller = new WalletController(null);
    expect(() => controller.overview({} as never, '50', 'unknown')).toThrow(BadRequestException);
  });
});

describe('wallet category HTTP validation', () => {
  it('returns 400 for invalid category without reading session or repository', () => {
    const controller = new WalletController(null);
    expect(() => controller.overview({} as never, '50', 'unknown')).toThrow(BadRequestException);
  });
});
