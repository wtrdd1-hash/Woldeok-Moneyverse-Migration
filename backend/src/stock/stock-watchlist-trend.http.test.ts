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
import type { StockRepository } from './stock.service';

const OWNER = '00000000-0000-4000-8000-000000000011';
const row = (price: string, open: string) => ({
  stock_id: '00000000-0000-4000-8000-000000000012', symbol: 'WLD', name: 'WLD',
  current_price: price, day_open_price: open, created_at: new Date('2026-10-30T00:00:00Z'),
});

describe('owner watchlist trend HTTP boundary', () => {
  let app: INestApplication;
  const repo = { watchlist: vi.fn(async () => [row('9007199254740993', '9007199254740992'), row('3', '4')]) };
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StockController],
      providers: [{ provide: StockService, useValue: new StockService(repo as unknown as StockRepository) }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: { switchToHttp(): { getRequest(): { session: unknown } } }) => {
        ctx.switchToHttp().getRequest().session = { user_id: OWNER }; return true;
      } })
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

  it('rejects duplicate and invalid trends before owner SQL', async () => {
    vi.clearAllMocks();
    for (const suffix of ['?trend=up&trend=down', '?trend=UP', '?trend=']) {
      await request(app.getHttpServer()).get('/api/v1/stocks/watchlist' + suffix).expect(400);
    }
    expect(repo.watchlist).not.toHaveBeenCalled();
  });
  it('returns only owner rising stocks with bigint precision and preserves default', async () => {
    vi.clearAllMocks();
    const rising = await request(app.getHttpServer()).get('/api/v1/stocks/watchlist?trend=up').expect(200);
    expect(rising.body.stocks).toHaveLength(1);
    expect(rising.body.stocks[0].current_price).toBe('9007199254740993');
    expect(repo.watchlist).toHaveBeenCalledWith(OWNER);
    const all = await request(app.getHttpServer()).get('/api/v1/stocks/watchlist').expect(200);
    expect(all.body.stocks).toHaveLength(2);
  });
});
