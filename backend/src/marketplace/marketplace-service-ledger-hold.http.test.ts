import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import type { Queryable } from '../core/db';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';

vi.mock('../auth/session.context', async (original) => ({
  ...(await original<typeof import('../auth/session.context')>()),
  requireUserId: () => '11111111-1111-4111-8111-111111111111',
}));

describe('P0 marketplace service financial hold at Nest HTTP boundary', () => {
  let app: INestApplication;
  const query = vi.fn().mockResolvedValue({ rows: [] });

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [MarketplaceController],
      providers: [{ provide: MarketplaceService, useValue: new MarketplaceService({ query } as unknown as Queryable) }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it.each([
    ['/marketplace/listings', { itemCode: 'frame', quantity: 1, price: '500', idempotencyKey: '33333333-3333-4333-8333-333333333333' }],
    ['/marketplace/listings/22222222-2222-4222-8222-222222222222/buy', { idempotencyKey: '33333333-3333-4333-8333-333333333333' }],
    ['/marketplace/auctions/22222222-2222-4222-8222-222222222222/bid', { bidAmountWld: '9000', maxProxyBidWld: '15000' }],
    ['/marketplace/auctions', { itemCode: 'item', itemName: 'Item', category: 'test', rarity: 'COMMON', startPriceWld: '100' }],
    ['/marketplace/trades', { recipientName: 'other', offeredWld: '100' }],
    ['/marketplace/trades/22222222-2222-4222-8222-222222222222/accept', {}],
    ['/marketplace/trades/22222222-2222-4222-8222-222222222222/confirm', {}],
  ])('returns HTTP 503 on unsafe POST %s without database access', async (path, body) => {
    const response = await request(app.getHttpServer()).post(path).send(body).expect(503);
    expect(response.body.message).toBe('marketplace_settlement_unverified');
    expect(query).not.toHaveBeenCalled();
  });
});
