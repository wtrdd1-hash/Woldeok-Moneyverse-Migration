import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import type { Queryable } from '../core/db';
import { MarketplaceService } from './marketplace.service';
import { MarketplaceController } from './marketplace.controller';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-1111-4111-8111-111111111111';
const tradeId = '22222222-2222-4222-8222-222222222222';
const proposal = {
  recipientName: 'OtherMember',
  offeredItems: [{ name: 'item', quantity: 1 }],
  offeredWld: '1000',
  requestedItems: [{ name: 'item2', quantity: 1 }],
  requestedWld: '500',
};
const unavailable = {
  status: 503,
  response: { code: 'MARKETPLACE_P2P_SETTLEMENT_UNAVAILABLE' },
};

describe('marketplace P2P authoritative service hold', () => {
  it.each([
    ['list', (service: MarketplaceService) => service.listTrades(actor)],
    ['create', (service: MarketplaceService) => service.createTrade(actor, proposal)],
    ['accept', (service: MarketplaceService) => service.acceptTrade(actor, tradeId)],
    ['confirm', (service: MarketplaceService) => service.confirmTrade(actor, tradeId)],
    ['cancel', (service: MarketplaceService) => service.cancelTrade(actor, tradeId)],
  ])('rejects %s before ANY database read or write', async (_name, invoke) => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: tradeId }], rowCount: 1 });
    const service = new MarketplaceService({ query } as unknown as Queryable);
    await expect(invoke(service)).rejects.toMatchObject(unavailable);
    expect(query).not.toHaveBeenCalled();
  });

  it('does not report success or an empty result when the pool is absent', async () => {
    const service = new MarketplaceService(null);
    await expect(service.listTrades(actor)).rejects.toMatchObject(unavailable);
    await expect(service.confirmTrade(actor, tradeId)).rejects.toMatchObject(unavailable);
  });

  it('preserves 503 through the authenticated Nest controller', async () => {
    const query = vi.fn();
    const service = new MarketplaceService({ query } as unknown as Queryable);
    const controller = new MarketplaceController(service);
    const request = { session: { user_id: actor } } as RequestWithSession;
    await expect(controller.listTrades(request)).rejects.toMatchObject(unavailable);
    await expect(controller.createTrade(request, proposal)).rejects.toMatchObject(unavailable);
    await expect(controller.acceptTrade(request, tradeId)).rejects.toMatchObject(unavailable);
    await expect(controller.confirmTrade(request, tradeId)).rejects.toMatchObject(unavailable);
    await expect(controller.cancelTrade(request, tradeId)).rejects.toMatchObject(unavailable);
    expect(query).not.toHaveBeenCalled();
  });
  it('retains session, consent, CSRF and private no-store route metadata', () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, MarketplaceController) ?? []) as Array<{ name: string }>;
    expect(guards.map((guard) => guard.name)).toEqual([
      'SessionGuard', 'AuthenticatedGuard', 'ConsentGuard',
    ]);
    for (const name of ['listTrades', 'createTrade', 'acceptTrade', 'confirmTrade', 'cancelTrade'] as const) {
      const method = MarketplaceController.prototype[name];
      const headers = (Reflect.getMetadata(HEADERS_METADATA, method) ?? []) as Array<{ name: string; value: string }>;
      expect(headers).toEqual(expect.arrayContaining([{ name: 'Cache-Control', value: 'no-store' }]));
      if (name !== 'listTrades') {
        const methodGuards = (Reflect.getMetadata(GUARDS_METADATA, method) ?? []) as Array<{ name: string }>;
        expect(methodGuards.map((guard) => guard.name)).toContain('CsrfGuard');
      }
    }
  });

});
