import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { AdvisorModule } from './advisor.module';
import { DeokiAdvisorController } from './deoki-advisor.controller';
import { DeokiAdvisorRepository } from './deoki-advisor.repository';

const OWNER = '11111111-1111-4111-8111-111111111111';
const diagnose = vi.fn().mockResolvedValue({ id: 'verified-diagnosis' });
const ask = vi.fn().mockResolvedValue({ answer: 'verified', tips: [] });

@Controller('public-advisor-probe')
class PublicProbeController {
  @Get()
  probe() { return { public: true }; }
}

@Module({
  controllers: [DeokiAdvisorController, PublicProbeController],
  providers: [{ provide: DeokiAdvisorRepository, useValue: { diagnoseUserPortfolio: diagnose, askDeoki: ask } }],
})
class AdvisorHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Exercise the production module's middleware, not a test-only replica.
    const configure = (new AdvisorModule() as NestModule).configure;
    if (typeof configure === 'function') configure(consumer);
  }
}

function assertPrivate(headers: Record<string, string | string[] | undefined>): void {
  expect(headers['cache-control']).toBe('private, no-store');
  expect(headers['x-robots-tag']).toBe('noindex');
  expect(headers['referrer-policy']).toBe('no-referrer');
}

describe('Deoki advisor owner HTTP privacy before session, consent and CSRF', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const session = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        req.session = { user_id: OWNER, id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
        return true;
      },
    };
    const consent = {
      canActivate: (context: ExecutionContext) => {
        if (context.switchToHttp().getRequest().headers['x-test-consent'] === '0') {
          throw new ForbiddenException('consent required');
        }
        return true;
      },
    };
    const csrf = {
      canActivate: (context: ExecutionContext) => {
        if (context.switchToHttp().getRequest().headers['x-test-csrf'] === '0') {
          throw new ForbiddenException('csrf required');
        }
        return true;
      },
    };
    const ref = await Test.createTestingModule({ imports: [AdvisorHttpFixture] })
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue(consent)
      .overrideGuard(CsrfGuard).useValue(csrf)
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['diagnosis', '/api/v1/advisor/deoki/diagnose'],
    ['question', '/api/v1/advisor/deoki/ask'],
  ])('protects unauthenticated %s refusals', async (_label, path) => {
    const res = path.endsWith('ask')
      ? await request(app.getHttpServer()).post(path).send({ question: 'risk' }).expect(401)
      : await request(app.getHttpServer()).get(path).expect(401);
    assertPrivate(res.headers);
  });

  it('protects diagnosis success and consent refusal', async () => {
    assertPrivate((await request(app.getHttpServer()).get('/api/v1/advisor/deoki/diagnose')
      .set('x-test-owner', '1').expect(200)).headers);
    assertPrivate((await request(app.getHttpServer()).get('/api/v1/advisor/deoki/diagnose')
      .set('x-test-owner', '1').set('x-test-consent', '0').expect(403)).headers);
  });

  it('protects question success and CSRF refusal', async () => {
    const path = '/api/v1/advisor/deoki/ask';
    assertPrivate((await request(app.getHttpServer()).post(path)
      .set('x-test-owner', '1').send({ question: 'risk' }).expect(201)).headers);
    assertPrivate((await request(app.getHttpServer()).post(path)
      .set('x-test-owner', '1').set('x-test-csrf', '0').send({ question: 'risk' }).expect(403)).headers);
  });

  it('protects failed financial-source reads and never exposes SQL errors', async () => {
    diagnose.mockRejectedValueOnce(new Error('private SQL 42501 permission denied'));
    const res = await request(app.getHttpServer()).get('/api/v1/advisor/deoki/diagnose')
      .set('x-test-owner', '1').expect(503);
    assertPrivate(res.headers);
    expect(res.text).not.toContain('42501');
  });

  it('protects HEAD without leaking a body', async () => {
    const res = await request(app.getHttpServer()).head('/api/v1/advisor/deoki/diagnose')
      .set('x-test-owner', '1').expect(200);
    assertPrivate(res.headers);
    expect(res.text).toBeUndefined();
  });

  it('does not impose owner privacy on an unrelated public endpoint', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/public-advisor-probe').expect(200);
    expect(res.headers['cache-control']).not.toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBeUndefined();
  });
});
