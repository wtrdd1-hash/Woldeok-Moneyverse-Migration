import { ForbiddenException, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

const ACTOR = '11111111-2222-4333-8444-555555555555';
const KEY = '33333333-4444-4555-8666-777777777777';

describe('P0 real HTTP land endpoints never issue synthetic ownership or WLD receipts', () => {
  let app: INestApplication;
  const listUserSpaces = vi.fn();

  beforeAll(async () => {
    const session = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-session'] !== '1') throw new UnauthorizedException();
        req.session = { id: ACTOR, user_id: ACTOR };
        return true;
      },
    };
    const consent = {
      canActivate: (context: ExecutionContext) => {
        if (context.switchToHttp().getRequest().headers['x-test-consent'] === '0') {
          throw new ForbiddenException();
        }
        return true;
      },
    };
    const moduleRef = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [{ provide: SpaceService, useValue: { listUserSpaces } }],
    })
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue(consent)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it.each([
    '/api/v1/spaces/real-estate/districts',
    '/api/v1/spaces/real-estate/lands',
    '/api/v1/spaces/real-estate/my-lands',
  ])('rejects unverified GET %s with a stable 503 contract', async (path) => {
    const response = await request(app.getHttpServer()).get(path).set('x-test-session', '1');
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('REAL_ESTATE_SOURCE_UNVERIFIED');
    expect(response.body).not.toHaveProperty('lands');
    expect(response.body).not.toHaveProperty('districts');
  });

  it.each([
    ['/api/v1/spaces/real-estate/purchase', {
      districtId: 'district-gangnam-teheran', landCode: 'LAND-TH-101',
      landTier: 'PRIME_HQ', priceWld: 25000000, idempotencyKey: KEY,
    }],
    ['/api/v1/spaces/real-estate/land-th-101/rent', {
      dailyRentWld: 50000, depositWld: 500000, idempotencyKey: KEY,
    }],
    ['/api/v1/spaces/real-estate/land-th-101/settle-rent', {}],
  ])('rejects unledgered POST %s with no success receipt', async (path, body) => {
    const response = await request(app.getHttpServer())
      .post(path).set('x-test-session', '1').send(body);
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('REAL_ESTATE_LEDGER_UNAVAILABLE');
    expect(response.body).not.toHaveProperty('success');
    expect(response.body).not.toHaveProperty('receipt');
    expect(response.body).not.toHaveProperty('settledAmountWld');
    expect(listUserSpaces).not.toHaveBeenCalled();
  });

  it('retains authentication and consent gates before the 503 response', async () => {
    const unauth = await request(app.getHttpServer()).post('/api/v1/spaces/real-estate/land-th-101/settle-rent');
    expect(unauth.status).toBe(401);
    const consent = await request(app.getHttpServer()).get('/api/v1/spaces/real-estate/my-lands')
      .set('x-test-session', '1').set('x-test-consent', '0');
    expect(consent.status).toBe(403);
  });
});
