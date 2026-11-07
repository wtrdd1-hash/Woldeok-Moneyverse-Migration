import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AccountController } from './account.controller';
import { AccountModule } from './account.module';
import { AccountService } from './account.service';

const OWNER = '00000000-0000-4000-8000-000000000001';
const IDENTITY = '00000000-0000-4000-8000-000000000002';

@Controller('public-probe')
class PublicProbeController {
  @Get() publicResponse() { return { ok: true }; }
}

@Module({
  controllers: [AccountController, PublicProbeController],
  providers: [{ provide: AccountService, useValue: {
    linkedIdentities: vi.fn().mockResolvedValue([{ id: IDENTITY, provider: 'discord' }]),
    unlinkIdentity: vi.fn().mockResolvedValue({ unlinked: true }),
    softDeleteAccount: vi.fn().mockResolvedValue({ status: 'scheduled' }),
  } }],
})
class AccountPrivacyFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    (new AccountModule() as AccountModule & Partial<NestModule>).configure?.(consumer);
  }
}

function expectPrivateHeaders(response: request.Response): void {
  expect(response.headers['cache-control']).toBe('private, no-store');
  expect(response.headers['x-robots-tag']).toBe('noindex');
  expect(response.headers['referrer-policy']).toBe('no-referrer');
}

describe('account identity and deletion HTTP privacy before authentication guards', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({ imports: [AccountPrivacyFixture] })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        if (req.headers['x-test-auth'] !== '1') throw new UnauthorizedException('login required');
        req.session = { user_id: OWNER, id: '00000000-0000-4000-8000-000000000003' };
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
      .overrideGuard(ReauthGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it.each([
    ['GET', '/account/identities', 200],
    ['DELETE', `/account/identities/${IDENTITY}`, 200],
    ['DELETE', '/account', 202],
    ['HEAD', '/account/identities', 200],
  ] as const)('protects authenticated %s %s (%s)', async (method, path, status) => {
    const response = await request(app.getHttpServer())[method.toLowerCase() as 'get' | 'delete' | 'head'](path)
      .set('x-test-auth', '1');
    expect(response.status).toBe(status);
    expectPrivateHeaders(response);
  });

  it.each([
    ['GET', '/account/identities', 401],
    ['DELETE', `/account/identities/${IDENTITY}`, 401],
    ['DELETE', '/account', 401],
    ['GET', '/account/identities', 403],
    ['DELETE', '/account', 403],
  ] as const)('protects %s %s rejected by guards (%s)', async (method, path, status) => {
    const response = await request(app.getHttpServer())[method.toLowerCase() as 'get' | 'delete'](path)
      .set('x-test-auth', status === 403 ? '1' : '0')
      .set('x-test-consent', status === 403 ? '0' : '1');
    expect(response.status).toBe(status);
    expectPrivateHeaders(response);
  });

  it('does not apply member privacy headers to unrelated public routes', async () => {
    const response = await request(app.getHttpServer()).get('/public-probe').expect(200);
    expect(response.headers['cache-control']).toBeUndefined();
    expect(response.headers['x-robots-tag']).toBeUndefined();
    expect(response.headers['referrer-policy']).toBeUndefined();
  });
});
