import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { EarlyGameController } from './early-game.controller';
import { EarlyGameModule } from './early-game.module';
import { EarlyGameRepository } from './early-game.repository';

const OWNER = '11111111-1111-4111-8111-111111111111';
const KEY = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const repository = {
  todayEvent: vi.fn().mockResolvedValue({ eventDate: '2026-11-01', claimed: false }),
  firstDayFlow: vi.fn().mockResolvedValue([]),
  claimEvent: vi.fn().mockResolvedValue({ claimed: true }),
};

@Controller('early-game-public-probe')
class PublicProbeController {
  @Get()
  probe() { return { public: true }; }
}

@Module({
  controllers: [EarlyGameController, PublicProbeController],
  providers: [{ provide: EarlyGameRepository, useValue: repository }],
})
class EarlyGameHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Exercise the production module's route-scoped middleware rather than
    // copying its header behavior into the fixture.
    const earlyGameModule = new EarlyGameModule();
    earlyGameModule.configure(consumer);
  }
}

function assertPrivate(headers: Record<string, string | string[] | undefined>): void {
  expect(headers['cache-control']).toBe('private, no-store');
  expect(headers['x-robots-tag']).toBe('noindex');
  expect(headers['referrer-policy']).toBe('no-referrer');
}

describe('early-game owner HTTP privacy before session, consent and CSRF guards', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const session = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        req.session = { user_id: OWNER, id: KEY };
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
    const ref = await Test.createTestingModule({ imports: [EarlyGameHttpFixture] })
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
    ['today', '/api/v1/early-game/today'],
    ['first-day', '/api/v1/early-game/first-day'],
  ])('protects successful %s read and its unauthorized refusal', async (_label, path) => {
    const ok = await request(app.getHttpServer()).get(path).set('x-test-owner', '1').expect(200);
    assertPrivate(ok.headers);
    const denied = await request(app.getHttpServer()).get(path).set('x-test-owner', '0').expect(401);
    assertPrivate(denied.headers);
  });

  it('protects owner event claim receipt and unauthorized refusal', async () => {
    const body = { idempotencyKey: KEY, eventDate: '2026-11-01' };
    const ok = await request(app.getHttpServer()).post('/api/v1/early-game/claims')
      .set('x-test-owner', '1').send(body).expect(201);
    assertPrivate(ok.headers);
    expect(repository.claimEvent).toHaveBeenCalledWith(KEY, OWNER, '2026-11-01');
    const denied = await request(app.getHttpServer()).post('/api/v1/early-game/claims')
      .set('x-test-owner', '0').send(body).expect(401);
    assertPrivate(denied.headers);
  });

  it('protects consent and CSRF refusal responses before guards', async () => {
    const consent = await request(app.getHttpServer()).get('/api/v1/early-game/today')
      .set('x-test-owner', '1').set('x-test-consent', '0').expect(403);
    assertPrivate(consent.headers);
    const csrf = await request(app.getHttpServer()).post('/api/v1/early-game/claims')
      .set('x-test-owner', '1').set('x-test-csrf', '0').send({ idempotencyKey: KEY, eventDate: '2026-11-01' }).expect(403);
    assertPrivate(csrf.headers);
  });

  it('protects HEAD responses without leaking a response body', async () => {
    const res = await request(app.getHttpServer()).head('/api/v1/early-game/today')
      .set('x-test-owner', '1').expect(200);
    assertPrivate(res.headers);
    expect(res.text).toBeUndefined();
  });

  it('does not make an unrelated public route private', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/early-game-public-probe').expect(200);
    expect(res.body).toEqual({ public: true });
    expect(res.headers['cache-control']).not.toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBeUndefined();
  });
});
