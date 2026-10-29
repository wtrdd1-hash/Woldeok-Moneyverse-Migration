import { describe, expect, it, vi } from 'vitest';
import { GoneException } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import type { WalletService } from './wallet.service';
import type { RequestWithSession } from '../auth/session.context';

describe('P1 exact-UUID-only wallet recipient privacy boundary', () => {
  it.each(['', '%', '_', 'a', 'alice', 'someone@example.com'])('retires nickname enumeration for query %s without a profile read', (query) => {
    const searchRecipients = vi.fn().mockResolvedValue([{ userId: '11111111-1111-4111-8111-111111111111', displayName: 'private' }]);
    const controller = new WalletController({ searchRecipients } as unknown as WalletService);
    expect(() => controller.searchRecipients({} as RequestWithSession, query)).toThrow(GoneException);
    expect(searchRecipients).not.toHaveBeenCalled();
  });
});
