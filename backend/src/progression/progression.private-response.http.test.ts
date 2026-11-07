import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { EarlyGameRepository } from '../early-game/early-game.repository';
import { ProgressionController } from './progression.controller';
import { ProgressionModule } from './progression.module';
import { ProgressionRepository } from './progression.repository';

const OWNER = '11111111-1111-4111-8111-111111111111';
const progression = {
  status: vi.fn().mockResolvedValue(null),
  refresh: vi.fn().mockResolvedValue(null),
  creditGrade: vi.fn().mockResolvedValue({ grade: 'C' }),
  loans: vi.fn().mockResolvedValue([]),
  creditLadder: vi.fn().mockResolvedValue([]),
};
const earlyGame = { unlocks: vi.fn().mockResolvedValue([]) };

@Controller('public-progression-probe')
class PublicProbeController {
  @Get()
  probe() { return { public: true }; }
}

@Module({
  controllers: [ProgressionController, PublicProbeController],
  providers: [
    { provide: ProgressionRepository, useValue: progression },
    { provide: EarlyGameRepository, useValue: earlyGame },
  ],
})
class ProgressionHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Run production module middleware, never a copied test-only implementation.
    const configure = (new ProgressionModule() as NestModule).configure;
    if (typeof configure === 'function') configure(consumer);
  }
}

function assertPrivate(headers: Record<string, string | string[] | undefined>): void {
  expect(headers['cache-control']).toBe('private, no-store');
  expect(headers['x-robots-tag']).toBe('noindex');
  expect(headers['referrer-policy']).toBe('no-referrer');
}

describe('progression owner HTTP privacy before authentication, consent and CSRF', () => {
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
    const ref = await Test.createTestingModule({ imports: [ProgressionHttpFixture] })
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
    ['stage', '/api/v1/progression'],
    ['credit and loans', '/api/v1/progression/credit'],
    ['early-game unlocks', '/api/v1/progression/early-game'],
  ])('protects successful %s read and unauthenticated refusal', async (_label, path) => {
    assertPrivate((await request(app.getHttpServer()).get(path).set('x-test-owner', '1').expect(200)).headers);
    assertPrivate((await request(app.getHttpServer()).get(path).expect(401)).headers);
  });

  it('protects refresh receipts and CSRF refusals', async () => {
    const path = '/api/v1/progression/refreshes';
    assertPrivate((await request(app.getHttpServer()).post(path).set('x-test-owner', '1').expect(201)).headers);
    assertPrivate((await request(app.getHttpServer()).post(path).set('x-test-owner', '1').set('x-test-csrf', '0').expect(403)).headers);
  });

  it('protects prestige read and rebirth refusals', async () => {
    assertPrivate((await request(app.getHttpServer()).get('/api/v1/progression/prestige').set('x-test-owner', '1').expect(503)).headers);
    assertPrivate((await request(app.getHttpServer()).post('/api/v1/progression/prestige/rebirths').set('x-test-owner', '1').expect(503)).headers);
  });

  it('protects consent refusal before guards', async () => {
    assertPrivate((await request(app.getHttpServer()).get('/api/v1/progression/credit')
      .set('x-test-owner', '1').set('x-test-consent', '0').expect(403)).headers);
  });

  it('protects HEAD owner reads', async () => {
    const res = await request(app.getHttpServer()).head('/api/v1/progression/credit')
      .set('x-test-owner', '1').expect(200);
    assertPrivate(res.headers);
    expect(res.text).toBeUndefined();
  });

  it('does not affect unrelated public routes', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/public-progression-probe').expect(200);
    expect(res.body).toEqual({ public: true });
    expect(res.headers['cache-control']).not.toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBeUndefined();
  });
});
