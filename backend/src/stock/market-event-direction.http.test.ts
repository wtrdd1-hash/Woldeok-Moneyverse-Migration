import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { StockController } from './stock.controller';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { StockService } from './stock.service';

describe('public market-event direction HTTP contract', () => {
  let app: INestApplication;
  const marketEvents = vi.fn(async () => []);
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [StockController],
      providers: [{ provide: StockService, useValue: { marketEvents } }],
    }).overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  it('rejects duplicate and unknown filters before reading SQL', async () => {
    marketEvents.mockClear();
    for (const suffix of ['?direction=up&direction=down', '?direction=', '?direction=all']) {
      await request(app.getHttpServer()).get('/api/v1/stocks/market-events' + suffix).expect(400);
    }
    expect(marketEvents).not.toHaveBeenCalled();
  });
  it('accepts up/down and preserves the existing unfiltered endpoint', async () => {
    marketEvents.mockClear();
    for (const suffix of ['?direction=up', '?direction=down', '']) {
      await request(app.getHttpServer()).get('/api/v1/stocks/market-events' + suffix).expect(200, { events: [] });
    }
    expect(marketEvents.mock.calls).toEqual([['up'], ['down'], [undefined]]);
  });
});
