import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ShopController } from './shop.controller';
import { ShopModule } from './shop.module';
import { ShopCatalogRepository } from './shop.repository';
import { ShopService } from './shop.service';

const OWNER = '00000000-0000-4000-8000-000000000001';
const ITEM = '00000000-0000-4000-8000-000000000002';

@Controller('public-probe')
class PublicProbeController { @Get() respond() { return { ok: true }; } }

@Module({
  controllers: [ShopController, PublicProbeController],
  providers: [
    { provide: ShopService, useValue: { catalog: vi.fn().mockResolvedValue([]), myPurchasesWithSummary: vi.fn().mockResolvedValue({ purchases: [] }) } },
    { provide: ShopCatalogRepository, useValue: {
      catalog: vi.fn().mockResolvedValue([]), holdings: vi.fn().mockResolvedValue([]),
      getCosmetics: vi.fn().mockResolvedValue([]),
    } },
  ],
})
class ShopPrivacyFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    (new ShopModule() as ShopModule & Partial<NestModule>).configure?.(consumer);
  }
}

function expectPrivate(response: request.Response): void {
  expect(response.headers['cache-control']).toBe('private, no-store');
  expect(response.headers['x-robots-tag']).toBe('noindex');
  expect(response.headers['referrer-policy']).toBe('no-referrer');
}

describe('owner-only shop HTTP privacy before authentication and consent', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [ShopPrivacyFixture] })
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
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['get', '/shop/purchases'], ['get', '/shop/purchases/export'],
    ['get', '/shop/catalog'], ['get', '/shop/compare'], ['get', '/shop/holdings'],
    ['post', `/shop/items/${ITEM}/purchases`], ['post', `/shop/catalog/${ITEM}/purchases`],
    ['post', `/shop/holdings/${ITEM}/equip`], ['post', `/shop/holdings/${ITEM}/consumptions`],
    ['post', `/shop/holdings/${ITEM}/upkeep-settlements`],
    ['head', '/shop/holdings'],
  ] as const)('sets private headers on rejected %s %s', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path).expect(401);
    expectPrivate(response);
  });

  it('protects a consent rejection on an owner read', async () => {
    const response = await request(app.getHttpServer()).get('/shop/holdings')
      .set('x-test-auth', '1').set('x-test-consent', '0').expect(403);
    expectPrivate(response);
  });

  it('protects a successful owner holdings response', async () => {
    const response = await request(app.getHttpServer()).get('/shop/holdings')
      .set('x-test-auth', '1').expect(200);
    expect(response.body).toEqual({ holdings: [] });
    expectPrivate(response);
  });

  it.each(['/shop/items', '/shop/public-catalog', `/shop/cosmetics/${OWNER}`, '/public-probe'])
  ('does not change the public cache contract of %s', async (path) => {
    const response = await request(app.getHttpServer()).get(path).expect(200);
    expect(response.headers['cache-control']).toBeUndefined();
    expect(response.headers['x-robots-tag']).toBeUndefined();
    expect(response.headers['referrer-policy']).toBeUndefined();
  });
});
