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

describe('P0 seeded marketplace auction HTTP read containment', () => {
  let app: INestApplication;
  const query = vi.fn().mockResolvedValue({ rows: [{ id: 'demo', currentBidWld: '8500' }] });

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

  it('returns 503 instead of 200 and never reads migration-seeded auction bids', async () => {
    const response = await request(app.getHttpServer()).get('/marketplace/auctions').expect(503);
    expect(response.body.message).toBe('marketplace_auction_source_unverified');
    expect(query).not.toHaveBeenCalled();
  });
});
