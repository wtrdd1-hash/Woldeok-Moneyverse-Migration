import 'reflect-metadata';
import {
  Controller,
  ForbiddenException,
  Get,
  MiddlewareConsumer,
  Module,
  NestModule,
  UnauthorizedException,
  VersioningType,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { BankController } from './bank.controller';
import { BankModule } from './bank.module';
import { BankRepository } from './bank.repository';
import { PocketController } from './pocket.controller';

const actor = '11111111-1111-4111-8111-111111111111';

@Controller('public-check')
class PublicCheckController {
  @Get()
  ping() { return { ok: true }; }
}

@Module({
  controllers: [BankController, PocketController, PublicCheckController],
  providers: [{
    provide: BankRepository,
    useValue: {
      getStanding: async () => ({ cash_balance: '125' }),
      listPockets: async () => [],
      getStandingSnapshot: async () => ({ cash_balance: '125', verified: true }),
      moveBalance: async () => ({ status: 'APPLIED' }),
    },
  }],
})
class BankHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Exercise the real BankModule middleware configuration without a live DB.
    const bankModule = new BankModule() as BankModule & Partial<NestModule>;
    bankModule.configure?.(consumer);
  }
}

describe('member banking and pockets HTTP privacy before auth/CSRF guards', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const session = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        req.session = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', user_id: actor };
        return true;
      },
    };
    const csrf = {
      canActivate: (context: ExecutionContext) => {
        if (context.switchToHttp().getRequest().headers['x-test-csrf'] !== '1') {
          throw new ForbiddenException('csrf denied');
        }
        return true;
      },
    };
    const ref = await Test.createTestingModule({ imports: [BankHttpFixture] })
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(CsrfGuard).useValue(csrf)
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['standing success', 'GET', '/api/v1/banking/standing', '1', undefined, 200],
    ['pocket list success', 'GET', '/api/v1/banking/pockets', '1', undefined, 200],
    ['standing snapshot success', 'GET', '/api/v1/banking/standing/snapshot', '1', undefined, 200],
    ['standing auth denied', 'GET', '/api/v1/banking/standing', '0', undefined, 401],
    ['pocket auth denied', 'GET', '/api/v1/banking/pockets', '0', undefined, 401],
    ['deposit CSRF denied', 'POST', '/api/v1/banking/deposit', '1', undefined, 403],
    ['standing HEAD', 'HEAD', '/api/v1/banking/standing', '1', undefined, 200],
  ] as const)('%s response is not publicly cacheable', async (_label, method, path, owner, csrf, status) => {
    const response = await request(app.getHttpServer())[method.toLowerCase() as 'get'](path)
      .set('x-test-owner', owner)
      .set('x-test-csrf', csrf ?? '0');
    expect(response.status).toBe(status);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toMatch(/noindex/);
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  it('does not impose banking privacy headers on unrelated public routes', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public-check').expect(200);
    expect(response.body).toEqual({ ok: true });
    expect(response.headers['cache-control']).toBeUndefined();
    expect(response.headers['x-robots-tag']).toBeUndefined();
    expect(response.headers['referrer-policy']).toBeUndefined();
  });
});
