import { describe, expect, it, vi } from 'vitest';
import { MarketplaceController } from './marketplace.controller';
import type { MarketplaceService } from './marketplace.service';
import type { RequestWithSession } from '../auth/session.context';

const actor = { session: { user_id: '11111111-1111-4111-8111-111111111111' } } as unknown as RequestWithSession;

describe('P0 fixed-price marketplace ledger hold', () => {
  it('rejects listing creation before the unledgered service can charge a fee', () => {
    const createListing = vi.fn();
    const controller = new MarketplaceController({ createListing } as unknown as MarketplaceService);
    expect(() => controller.createListing(actor, {
      itemCode: 'test_item', quantity: 1, price: '100', idempotencyKey: 'key',
    })).toThrowError(/ledger-backed settlement/i);
    expect(createListing).not.toHaveBeenCalled();
  });

  it('rejects fixed-price purchase before the unledgered service can debit WLD', () => {
    const buyListing = vi.fn();
    const controller = new MarketplaceController({ buyListing } as unknown as MarketplaceService);
    expect(() => controller.buyListing(actor, '22222222-2222-4222-8222-222222222222', {
      idempotencyKey: 'key',
    })).toThrowError(/ledger-backed settlement/i);
    expect(buyListing).not.toHaveBeenCalled();
  });
});
