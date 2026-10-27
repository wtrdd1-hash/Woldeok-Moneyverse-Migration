import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

const STOCK = '00000000-0000-4000-8000-000000000001';

describe('public stock price HTTP query boundary', () => {
  let app: INestApplication;
  const service = {
    sparkSeries: vi.fn(async () => []),
    priceHistory: vi.fn(async () => []),
    candles: vi.fn(async () => []),
    priceRange: vi.fn(async () => null),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StockController],
      providers: [{ provide: StockService, useValue: service }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('rejects malformed and duplicate public price limits before service reads', async () => {
    vi.clearAllMocks();
    for (const path of [
      '/api/v1/stocks/sparklines',
      `/api/v1/stocks/${STOCK}/prices`,
      `/api/v1/stocks/${STOCK}/candles`,
    ]) {
      for (const query of ['?limit=', '?limit=1e2', '?limit=0x10', '?limit=10&limit=20']) {
        await request(app.getHttpServer()).get(path + query).expect(400);
      }
    }
    expect(service.sparkSeries).not.toHaveBeenCalled();
    expect(service.priceHistory).not.toHaveBeenCalled();
    expect(service.candles).not.toHaveBeenCalled();
    expect(service.priceRange).not.toHaveBeenCalled();
  });

  it('rejects noncanonical candle intervals and retains valid queries', async () => {
    vi.clearAllMocks();
    for (const query of ['?interval=3e2', '?interval=0300', '?interval=300&interval=300']) {
      await request(app.getHttpServer()).get(`/api/v1/stocks/${STOCK}/candles` + query).expect(400);
    }
    await request(app.getHttpServer()).get('/api/v1/stocks/sparklines?limit=240').expect(200);
    await request(app.getHttpServer()).get(`/api/v1/stocks/${STOCK}/prices?limit=240`).expect(200);
    await request(app.getHttpServer()).get(`/api/v1/stocks/${STOCK}/candles?interval=300&limit=400`).expect(200);
    expect(service.sparkSeries).toHaveBeenCalledWith(240);
    expect(service.priceHistory).toHaveBeenCalledWith(STOCK, 240);
    expect(service.candles).toHaveBeenCalledWith(STOCK, 300, 400);
  });
});
