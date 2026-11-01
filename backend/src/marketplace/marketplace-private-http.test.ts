import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceModule } from './marketplace.module';
import { MarketplaceService } from './marketplace.service';

const OWNER = '00000000-0000-4000-8000-000000000001';
const ITEM = '00000000-0000-4000-8000-000000000002';

@Controller('public-probe')
class PublicProbeController { @Get() respond() { return { ok: true }; } }

@Module({
  controllers: [MarketplaceController, PublicProbeController],
  providers: [{ provide: MarketplaceService, useValue: {
    listListings: vi.fn().mockResolvedValue([]),
    listAuctions: vi.fn().mockResolvedValue([]),
    listMyListings: vi.fn().mockResolvedValue([]),
    listTrades: vi.fn().mockResolvedValue([]),
    listAppraisals: vi.fn().mockResolvedValue([]),
  } }],
})
class MarketplacePrivacyFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    (new MarketplaceModule() as MarketplaceModule & Partial<NestModule>).configure?.(consumer);
  }
}

function expectPrivate(response: request.Response): void {
  expect(response.headers['cache-control']).toBe('private, no-store');
  expect(response.headers['x-robots-tag']).toBe('noindex');
  expect(response.headers['referrer-policy']).toBe('no-referrer');
}

describe('marketplace owner HTTP privacy before session, consent and CSRF guards', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({ imports: [MarketplacePrivacyFixture] })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        if (req.headers['x-test-auth'] !== '1') throw new UnauthorizedException('login required');
        req.session = { user_id: OWNER, id: ITEM };
        return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        if (ctx.switchToHttp().getRequest().headers['x-test-consent'] === '0') {
          throw new ForbiddenException('consent required');
        }
        return true;
      } })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['get', '/marketplace/my-listings'],
    ['post', '/marketplace/listings'],
    ['post', `/marketplace/listings/${ITEM}/buy`],
    ['post', `/marketplace/listings/${ITEM}/cancel`],
    ['post', '/marketplace/auctions'],
    ['post', `/marketplace/auctions/${ITEM}/bid`],
    ['get', '/marketplace/trades'],
    ['post', '/marketplace/trades'],
    ['post', `/marketplace/trades/${ITEM}/accept`],
    ['post', `/marketplace/trades/${ITEM}/confirm`],
    ['post', `/marketplace/trades/${ITEM}/cancel`],
    ['get', '/marketplace/appraisals'],
    ['post', '/marketplace/appraisals'],
    ['head', '/marketplace/my-listings'],
  ] as const)('protects rejected %s %s', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path).expect(401);
    expectPrivate(response);
  });

  it('protects owner data when consent rejects the request', async () => {
    const response = await request(app.getHttpServer()).get('/marketplace/trades')
      .set('x-test-auth', '1').set('x-test-consent', '0').expect(403);
    expectPrivate(response);
  });

  it.each(['/marketplace/my-listings', '/marketplace/trades', '/marketplace/appraisals'])(
    'protects successful owner data on %s', async (path) => {
      const response = await request(app.getHttpServer()).get(path).set('x-test-auth', '1').expect(200);
      expect(response.body).toEqual([]);
      expectPrivate(response);
    },
  );

  it.each(['/marketplace/listings', '/marketplace/auctions', '/public-probe'])(
    'preserves public GET cache behavior on %s', async (path) => {
      const response = await request(app.getHttpServer()).get(path).set('x-test-auth', '1').expect(200);
      expect(response.headers['cache-control']).toBeUndefined();
      expect(response.headers['x-robots-tag']).toBeUndefined();
      expect(response.headers['referrer-policy']).toBeUndefined();
    },
  );
});
