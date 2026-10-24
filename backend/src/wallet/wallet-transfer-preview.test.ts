import { describe, expect, it, vi } from 'vitest';
import { WalletRecipientError, WalletService, type WalletRepositoryLike } from './wallet.service';
import { WalletInputError } from './wallet.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import type { RequestWithSession } from '../auth/session.context';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const RECIPIENT = '22222222-2222-4222-8222-222222222222';

function fixture(cash = '100') {
  const balanceReads: string[] = [];
  const recipientReads: string[] = [];
  const transfer = vi.fn();
  const repository = {
    balancesForUser: async (id: string) => {
      balanceReads.push(id);
      return [
        { account_type: 'USER_CASH', available_amount: cash, updated_at: new Date('2026-10-24T11:00:00Z') },
        { account_type: 'USER_BANK', available_amount: '999999', updated_at: new Date('2026-10-24T11:00:00Z') },
      ];
    },
    activeRecipientById: async (id: string) => {
      recipientReads.push(id);
      return id === RECIPIENT ? { userId: id } : null;
    },
    recentTransactionsForUser: async () => [],
    transfer,
    claimDaily: async () => ({ transactionId: ACTOR, amount: '1', replayed: false }),
  } as unknown as WalletRepositoryLike;
  return { service: new WalletService(repository, { clock: () => new Date('2026-10-24T11:30:00Z') }), balanceReads, recipientReads, transfer };
}

describe('wallet transfer preview (read-only, not a receipt)', () => {
  it('uses owner cash and active recipient, exact huge integer strings, and performs no writes', async () => {
    const huge = '9'.repeat(38);
    const f = fixture(huge);
    const preview = await f.service.previewTransfer(ACTOR, RECIPIENT, huge);
    expect(preview).toMatchObject({ recipientUserId: RECIPIENT, amount: huge, cashAvailable: huge, canSend: true, shortfall: '0', readOnly: true });
    expect(preview.checkedAt).toBe('2026-10-24T11:30:00.000Z');
    expect(f.balanceReads).toEqual([ACTOR]);
    expect(f.recipientReads).toEqual([RECIPIENT]);
    expect(f.transfer).not.toHaveBeenCalled();
  });

  it('calculates shortfall from cash only, not the bank pocket', async () => {
    const f = fixture('100');
    const preview = await f.service.previewTransfer(ACTOR, RECIPIENT, '101');
    expect(preview).toMatchObject({ canSend: false, shortfall: '1', cashAvailable: '100' });
    expect(f.transfer).not.toHaveBeenCalled();
  });

  it('does not reveal a missing or inactive recipient', async () => {
    const f = fixture();
    await expect(f.service.previewTransfer(ACTOR, '33333333-3333-4333-8333-333333333333', '1')).rejects.toBeInstanceOf(WalletRecipientError);
    expect(f.transfer).not.toHaveBeenCalled();
  });

  it('rejects self-transfer and noncanonical or unsafe numeric inputs', async () => {
    const f = fixture();
    await expect(f.service.previewTransfer(ACTOR, ACTOR, '1')).rejects.toBeInstanceOf(WalletInputError);
    for (const amount of ['0', '01', '-1', '1.5', '1e3', Number.MAX_SAFE_INTEGER + 1]) {
      await expect(f.service.previewTransfer(ACTOR, RECIPIENT, amount)).rejects.toBeInstanceOf(WalletInputError);
    }
    expect(f.balanceReads).toEqual([]);
  });

  it('fails closed if the caller has no valid cash and bank accounts', async () => {
    const f = fixture('oops');
    await expect(f.service.previewTransfer(ACTOR, RECIPIENT, '10')).rejects.toThrow();
  });
});


describe('transfer preview controller HTTP semantics', () => {
  const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
  it('maps missing recipient to the same 404 regardless of existence and rejects bad amount with 400', async () => {
    const controller = new WalletController(fixture().service);
    await expect(controller.previewTransfer(request, '33333333-3333-4333-8333-333333333333', '1')).rejects.toBeInstanceOf(NotFoundException);
    await expect(controller.previewTransfer(request, RECIPIENT, '01')).rejects.toBeInstanceOf(BadRequestException);
  });
  it('requires a bound authenticated user even when a valid target is supplied', async () => {
    const controller = new WalletController(fixture().service);
    await expect(controller.previewTransfer({} as RequestWithSession, RECIPIENT, '1')).rejects.toThrow('guard order defect');
  });
});
