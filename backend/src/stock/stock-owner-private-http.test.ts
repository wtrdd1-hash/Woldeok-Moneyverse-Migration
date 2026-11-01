import { ForbiddenException, MiddlewareConsumer, Module, NestModule, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { StockController } from './stock.controller';
import { StockModule } from './stock.module';
import { StockService } from './stock.service';

const stockId = '22222222-2222-4222-8222-222222222222';
const stub = {
  list: async () => [], watchlist: async () => [], portfolio: async () => [],
  haltSettlementReceipts: async () => [], history: async () => [],
  setWatchlist: async () => ({ watching: true }), trade: async () => ({ receiptId: 'ok' }),
  sparkSeries: async () => [], marketEvents: async () => [],
  priceHistory: async () => [], candles: async () => [], priceRange: async () => null,
};

@Module({
  controllers: [StockController],
  providers: [{ provide: StockService, useValue: stub }],
})
class StockOwnerHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // The baseline module has no middleware; the RED tests must reach real HTTP routes.
    const stockModule = new StockModule() as StockModule & Partial<NestModule>;
    stockModule.configure?.(consumer);
  }
}

describe('stock owner HTTP privacy before authentication guards', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const session = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => { headers: Record<string, string>; session?: unknown } } }) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        req.session = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', user_id: '11111111-1111-4111-8111-111111111111' };
        return true;
      },
    };
    const consent = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => { headers: Record<string, string> } } }) => {
        if (context.switchToHttp().getRequest().headers['x-test-consent'] === '0') {
          throw new ForbiddenException('consent required');
        }
        return true;
      },
    };
    const ref = await Test.createTestingModule({ imports: [StockOwnerHttpFixture] })
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(consent)
      .overrideGuard(CsrfGuard).useValue(allow)
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['watchlist', '/api/v1/stocks/watchlist'],
    ['portfolio', '/api/v1/stocks/portfolio'],
    ['trade history', '/api/v1/stocks/history'],
    ['halt settlement receipts', '/api/v1/stocks/halt-receipts'],
  ])('protects owner %s GET, including 401 and 403', async (_name, path) => {
    for (const [owner, consent, status] of [['1', '1', 200], ['0', '1', 401], ['1', '0', 403]] as const) {
      const response = await request(app.getHttpServer()).get(path)
        .set('x-test-owner', owner).set('x-test-consent', consent);
      expect(response.status).toBe(status);
      expect(response.headers['cache-control']).toBe('private, no-store');
      expect(response.headers['x-robots-tag']).toBe('noindex');
      expect(response.headers['referrer-policy']).toBe('no-referrer');
    }
  });

  it.each([
    ['watchlist mutation', `/api/v1/stocks/${stockId}/watchlist`, { watching: true }],
    ['trade order receipt', `/api/v1/stocks/${stockId}/orders`, { side: 'buy', quantity: 1, idempotencyKey: stockId }],
  ])('protects %s POST success and rejected responses', async (_name, path, body) => {
    for (const [owner, status] of [['1', 201], ['0', 401]] as const) {
      const response = await request(app.getHttpServer()).post(path)
        .set('x-test-owner', owner).send(body);
      expect(response.status).toBe(status);
      expect(response.headers['cache-control']).toBe('private, no-store');
      expect(response.headers['x-robots-tag']).toBe('noindex');
      expect(response.headers['referrer-policy']).toBe('no-referrer');
    }
  });

  it('protects HEAD on an owner route before guards', async () => {
    const response = await request(app.getHttpServer()).head('/api/v1/stocks/portfolio');
    expect(response.status).toBe(401);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  it.each([
    ['/api/v1/stocks', 'stocks'],
    ['/api/v1/stocks/sparklines', 'series'],
    ['/api/v1/stocks/market-events', 'events'],
    [`/api/v1/stocks/${stockId}/prices`, 'prices'],
    [`/api/v1/stocks/${stockId}/candles`, 'candles'],
  ])('does not mark public %s as owner-private', async (path, key) => {
    const response = await request(app.getHttpServer()).get(path);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(key);
    expect(response.headers['cache-control']).not.toBe('private, no-store');
    expect(response.headers['x-robots-tag']).not.toBe('noindex');
  });
});
