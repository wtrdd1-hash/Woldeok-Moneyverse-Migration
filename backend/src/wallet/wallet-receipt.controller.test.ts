import { NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const TX = '22222222-2222-4222-8222-222222222222';
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

describe('wallet receipt controller boundary', () => {
  it('derives the owner from the session, not caller input', async () => {
    const recentReceiptForUser = vi.fn(async () => ({ transactionId: TX }));
    const controller = new WalletController({ recentReceiptForUser } as unknown as WalletService);
    await expect(controller.recentReceipt(request, TX)).resolves.toEqual({ transactionId: TX });
    expect(recentReceiptForUser).toHaveBeenCalledWith(ACTOR, TX);
  });

  it('uses the same 404 for unknown and malformed references', async () => {
    const recentReceiptForUser = vi.fn(async () => null);
    const controller = new WalletController({ recentReceiptForUser } as unknown as WalletService);
    await expect(controller.recentReceipt(request, TX)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('marks the private endpoint as non-cacheable', () => {
    const headers = Reflect.getMetadata('__headers__', WalletController.prototype.recentReceipt);
    expect(headers).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Cache-Control', value: 'private, no-store' }),
    ]));
  });
});
