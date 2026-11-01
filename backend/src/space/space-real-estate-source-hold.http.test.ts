import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

// Guard stubs isolate the HTTP contract; the controller still declares its real guards.
describe('P0 real-estate Nest HTTP source-truth boundary', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [{ provide: SpaceService, useValue: {} }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it.each(['/spaces/real-estate/districts', '/spaces/real-estate/lands', '/spaces/real-estate/my-lands'])(
    'does not return fabricated GET %s', async (path) => {
      const response = await request(app.getHttpServer()).get(path).expect(503);
      expect(response.body.code).toBe('REAL_ESTATE_SOURCE_UNVERIFIED');
      expect(response.body).not.toHaveProperty('lands');
      expect(response.body).not.toHaveProperty('districts');
    },
  );

  it.each([
    ['/spaces/real-estate/purchase', { districtId: 'd1', landCode: 'LAND-1', landTier: 'STANDARD', priceWld: 10000, idempotencyKey: '22222222-3333-4444-8555-666666666666' }],
    ['/spaces/real-estate/land-1/rent', { dailyRentWld: 100, depositWld: 1000, idempotencyKey: '22222222-3333-4444-8555-666666666666' }],
    ['/spaces/real-estate/land-1/settle-rent', {}],
  ])('does not fabricate WLD settlement POST %s', async (path, body) => {
    const response = await request(app.getHttpServer()).post(path).send(body).expect(503);
    expect(response.body.code).toBe('REAL_ESTATE_LEDGER_UNAVAILABLE');
    expect(response.body).not.toHaveProperty('success', true);
    expect(response.body).not.toHaveProperty('receipt');
  });
});
