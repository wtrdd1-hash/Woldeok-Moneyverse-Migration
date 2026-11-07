import { ForbiddenException, Module, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SeasonController } from './season.controller';
import { SeasonService } from './season.service';

const settle = vi.fn();
@Module({
  controllers: [SeasonController],
  providers: [{ provide: SeasonService, useValue: { settle } }],
})
class SeasonHttpFixture {}

describe('season settlement HTTP fail-closed boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const session = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => { headers: Record<string, string> } } }) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        return true;
      },
    };
    const csrf = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => { headers: Record<string, string> } } }) => {
        if (context.switchToHttp().getRequest().headers['x-test-csrf'] !== '1') {
          throw new ForbiddenException('csrf required');
        }
        return true;
      },
    };
    const ref = await Test.createTestingModule({ imports: [SeasonHttpFixture] })
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

  it('returns a coded 503 after successful guards without invoking settlement', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/seasons/settle')
      .set('x-test-owner', '1').set('x-test-csrf', '1')
      .send({ seasonId: '22222222-2222-4222-8222-222222222222' });
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('SEASON_SETTLEMENT_UNAVAILABLE');
    expect(settle).not.toHaveBeenCalled();
  });

  it('retains authentication and CSRF refusal before the hold', async () => {
    const anonymous = await request(app.getHttpServer()).post('/api/v1/seasons/settle').send({});
    expect(anonymous.status).toBe(401);
    const noCsrf = await request(app.getHttpServer()).post('/api/v1/seasons/settle')
      .set('x-test-owner', '1').send({});
    expect(noCsrf.status).toBe(403);
    expect(settle).not.toHaveBeenCalled();
  });
});
