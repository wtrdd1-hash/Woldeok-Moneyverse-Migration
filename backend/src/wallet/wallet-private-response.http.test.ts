import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, UnauthorizedException, ServiceUnavailableException, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { WalletController } from './wallet.controller';
import { WalletModule } from './wallet.module';
import { WalletService } from './wallet.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const KEY = '44444444-4444-4444-8444-444444444444';

@Controller('public-probe')
class PublicProbeController {
  @Get()
  get() { return { ok: true }; }
}

@Module({
  controllers: [WalletController, PublicProbeController],
  providers: [{ provide: WalletService, useValue: {
    overview: async () => ({ balances: [], recent: [] }),
    activityPage: async () => ({ transactions: [], hasMore: false, nextCursor: null }),
    transferReceipt: async () => ({ status: 'unknown' }),
    rewardAvailability: async () => ({ available: false }),
    loans: async () => [],
    transfer: async (_actor: string, body: { amount: string }) => {
      if (body.amount === '999') throw new ServiceUnavailableException('ledger unavailable');
      return { status: 'committed' };
    },
  } }],
})
class WalletHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    (new WalletModule() as WalletModule & Partial<NestModule>).configure?.(consumer);
  }
}

describe('wallet financial response privacy on actual Nest HTTP', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [WalletHttpFixture] })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: { switchToHttp(): { getRequest(): { headers: Record<string, string>; session?: unknown } } }) => {
          const req = ctx.switchToHttp().getRequest();
          if (req.headers['x-test-auth'] !== '1') throw new UnauthorizedException('login required');
          req.session = { id: '33333333-3333-4333-8333-333333333333', user_id: ACTOR };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({
        canActivate: (ctx: { switchToHttp(): { getRequest(): { headers: Record<string, string> } } }) => {
          if (ctx.switchToHttp().getRequest().headers['x-test-consent'] === '0') {
            throw new ForbiddenException('consent required');
          }
          return true;
        },
      })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['/api/v1/wallet', 200],
    ['/api/v1/wallet/activity?period=7d', 200],
    [`/api/v1/wallet/transfers/receipts/${KEY}`, 200],
    ['/api/v1/wallet/activity?direction=invalid', 400],
    ['/api/v1/rewards/availability', 200],
    ['/api/v1/bank/loans', 200],
  ] as const)('protects authenticated GET %s (%s)', async (path, status) => {
    const res = await request(app.getHttpServer()).get(path).set('x-test-auth', '1');
    expect(res.status).toBe(status);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it.each([
    ['GET', '/api/v1/wallet', 401],
    ['GET', '/api/v1/wallet/activity', 401],
    ['GET', `/api/v1/wallet/transfers/receipts/${KEY}`, 401],
    ['POST', '/api/v1/wallet/transfers', 401],
    ['GET', '/api/v1/wallet', 403],
  ] as const)('protects %s %s guard rejection %s', async (method, path, status) => {
    const req = method === 'POST' ? request(app.getHttpServer()).post(path) : request(app.getHttpServer()).get(path);
    const res = await req.set('x-test-auth', status === 403 ? '1' : '0')
      .set('x-test-consent', status === 403 ? '0' : '1');
    expect(res.status).toBe(status);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it.each([['100', 201], ['999', 503]] as const)('protects wallet transfer POST %s (%s)', async (amount, status) => {
    const res = await request(app.getHttpServer()).post('/api/v1/wallet/transfers')
      .set('x-test-auth', '1')
      .send({ recipientUserId: '22222222-2222-4222-8222-222222222222', amount, idempotencyKey: KEY });
    expect(res.status).toBe(status);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it('protects HEAD with query string', async () => {
    const res = await request(app.getHttpServer()).head('/api/v1/wallet?recent=5').set('x-test-auth', '1');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it('does not add member-only policy to unrelated public routes', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/public-probe');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBeUndefined();
    expect(res.headers['x-robots-tag']).toBeUndefined();
    expect(res.headers['referrer-policy']).toBeUndefined();
  });
});
