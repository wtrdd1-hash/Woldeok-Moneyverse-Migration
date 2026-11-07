import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, ServiceUnavailableException, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SeasonController } from './season.controller';
import { SeasonModule } from './season.module';
import { SeasonService } from './season.service';

const OWNER = '11111111-1111-4111-8111-111111111111';
const seasons = {
  events: vi.fn().mockResolvedValue([]),
  leaderboard: vi.fn().mockResolvedValue([]),
  current: vi.fn().mockResolvedValue(null),
  hallOfFame: vi.fn().mockResolvedValue([]),
  settle: vi.fn().mockRejectedValue(new ServiceUnavailableException('season settlement unavailable')),
  consume: vi.fn().mockRejectedValue(new ServiceUnavailableException('season event unavailable')),
};

@Controller('public-season-probe')
class PublicProbeController {
  @Get()
  probe() { return { public: true }; }
}

@Module({
  controllers: [SeasonController, PublicProbeController],
  providers: [{ provide: SeasonService, useValue: seasons }],
})
class SeasonHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Exercise production middleware rather than a test-only copy.
    const configure = (new SeasonModule() as NestModule).configure;
    if (typeof configure === 'function') configure(consumer);
  }
}

function assertPrivate(headers: Record<string, string | string[] | undefined>): void {
  expect(headers['cache-control']).toBe('private, no-store');
  expect(headers['x-robots-tag']).toBe('noindex');
  expect(headers['referrer-policy']).toBe('no-referrer');
}

describe('season member HTTP privacy before session, consent and CSRF guards', () => {
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
    const ref = await Test.createTestingModule({ imports: [SeasonHttpFixture] })
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
    ['season events', '/api/v1/seasons/events'],
    ['member rank', '/api/v1/seasons/current'],
    ['hall of fame', '/api/v1/seasons/hall-of-fame'],
  ])('protects successful %s and unauthorized rejection', async (_label, path) => {
    assertPrivate((await request(app.getHttpServer()).get(path).set('x-test-owner', '1').expect(200)).headers);
    assertPrivate((await request(app.getHttpServer()).get(path).expect(401)).headers);
  });

  it('protects consent refusal before handler execution', async () => {
    assertPrivate((await request(app.getHttpServer()).get('/api/v1/seasons/current')
      .set('x-test-owner', '1').set('x-test-consent', '0').expect(403)).headers);
  });

  it('protects settlement refusals including CSRF and unavailable backend', async () => {
    const path = '/api/v1/seasons/settle';
    assertPrivate((await request(app.getHttpServer()).post(path)
      .set('x-test-owner', '1').set('x-test-csrf', '0').expect(403)).headers);
    assertPrivate((await request(app.getHttpServer()).post(path)
      .set('x-test-owner', '1').send({}).expect(503)).headers);
  });

  it('protects HEAD member responses', async () => {
    const res = await request(app.getHttpServer()).head('/api/v1/seasons/current')
      .set('x-test-owner', '1').expect(200);
    assertPrivate(res.headers);
    expect(res.text).toBeUndefined();
  });

  it('does not apply private owner policy to unrelated public endpoints', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/public-season-probe').expect(200);
    expect(res.headers['cache-control']).not.toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBeUndefined();
  });
});
