import 'reflect-metadata';
import {
  Controller,
  ForbiddenException,
  Get,
  MiddlewareConsumer,
  Module,
  NestModule,
  UnauthorizedException,
} from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { BusinessController } from './business.controller';
import { BusinessModule } from './business.module';
import { BusinessService } from './business.service';
import { VenturesController } from './ventures.controller';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const ID = '22222222-2222-4222-8222-222222222222';

@Controller('public-business-probe')
class PublicProbeController {
  @Get()
  value() {
    return { public: true };
  }
}

@Module({
  controllers: [BusinessController, VenturesController, PublicProbeController],
  providers: [{
    provide: BusinessService,
    useValue: {
      mine: async () => [],
      mineV2: async () => [],
      catalog: async () => [],
      equity: async () => ({ cash: '12345678901234567890' }),
    },
  }],
})
class BusinessPrivacyFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    const businessModule = new BusinessModule() as BusinessModule & Partial<NestModule>;
    businessModule.configure?.(consumer);
  }
}

function expectPrivate(response: request.Response): void {
  expect(response.headers['cache-control']).toBe('private, no-store');
  expect(response.headers['x-robots-tag']).toBe('noindex');
  expect(response.headers['referrer-policy']).toBe('no-referrer');
}

describe('business owner HTTP privacy before authentication/consent guards', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({ imports: [BusinessPrivacyFixture] })
      .overrideGuard(SessionGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          if (req.headers['x-test-auth'] !== '1') throw new UnauthorizedException('login required');
          req.session = { user_id: ACTOR, id: ID };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          if (context.switchToHttp().getRequest().headers['x-test-consent'] === '0') {
            throw new ForbiddenException('consent required');
          }
          return true;
        },
      })
      .overrideGuard(CsrfGuard)
      .useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each([
    ['get', '/business-types'],
    ['get', '/businesses/catalog'],
    ['get', '/businesses'],
    ['get', '/businesses/my-v2'],
    ['get', '/business-equity'],
    ['get', '/businesses/equity'],
    ['post', '/business-types/123/purchases'],
    ['post', '/businesses/catalog/123/purchases'],
    ['post', `/businesses/${ID}/settlements`],
    ['post', `/businesses/${ID}/settle-v2`],
    ['post', '/businesses/activate-license'],
    ['post', `/businesses/${ID}/boost`],
    ['get', `/businesses/${ID}/supply-chain`],
    ['post', `/businesses/${ID}/procure`],
    ['post', `/businesses/${ID}/storage/upgrade`],
    ['get', '/businesses/ventures/pitches'],
    ['get', '/businesses/ventures/investments'],
    ['post', '/businesses/ventures/invest'],
    ['post', '/businesses/ventures/claim-dividend'],
    ['post', '/businesses/ventures/apply-founder'],
    ['head', '/businesses'],
  ] as const)('protects unauthenticated %s %s', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path).expect(401);
    expectPrivate(response);
  });

  it('protects consent-denied business owner response', async () => {
    const response = await request(app.getHttpServer())
      .get('/businesses')
      .set('x-test-auth', '1')
      .set('x-test-consent', '0')
      .expect(403);
    expectPrivate(response);
  });

  it.each(['/businesses', '/businesses/my-v2'])(
    'protects successful owner data on %s',
    async (path) => {
      const response = await request(app.getHttpServer())
        .get(path)
        .set('x-test-auth', '1')
        .expect(200);
      expect(response.body).toEqual({ businesses: [] });
      expectPrivate(response);
    },
  );

  it.each(['/businesses/ventures/pitches', '/businesses/ventures/investments'])(
    'protects venture source-unavailable responses on %s', async (path) => {
    const response = await request(app.getHttpServer())
      .get(path)
      .set('x-test-auth', '1')
      .expect(503);
    expectPrivate(response);
  });

  it('does not change unrelated public route cache or crawler headers', async () => {
    const response = await request(app.getHttpServer()).get('/public-business-probe').expect(200);
    expect(response.headers['cache-control']).toBeUndefined();
    expect(response.headers['x-robots-tag']).toBeUndefined();
    expect(response.headers['referrer-policy']).toBeUndefined();
  });
});
