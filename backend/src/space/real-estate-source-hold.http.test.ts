import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SpaceController } from './space.controller';
import { SpaceService } from './space.service';

vi.mock('../auth/session.context', async (original) => ({
  ...(await original<typeof import('../auth/session.context')>()),
  requireUserId: () => '11111111-1111-4111-8111-111111111111',
}));

describe('real estate Nest HTTP source integrity hold', () => {
  let app: INestApplication;
  const service = {
    listUserSpaces: vi.fn(),
    purchaseSpace: vi.fn(),
    getSpaceById: vi.fn(),
  };

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [SpaceController],
      providers: [{ provide: SpaceService, useValue: service }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it.each([
    '/spaces/real-estate/districts',
    '/spaces/real-estate/lands',
    '/spaces/real-estate/my-lands',
  ])('returns 503, not fabricated market or member data on GET %s', async (path) => {
    const response = await request(app.getHttpServer()).get(path).expect(503);
    expect(response.body.code).toBe('REAL_ESTATE_SOURCE_UNVERIFIED');
    expect(response.body).not.toHaveProperty('lands');
    expect(response.body).not.toHaveProperty('districts');
  });

  it.each([
    ['/spaces/real-estate/purchase', { districtId: 'x', landCode: 'y', landTier: 'COMMERCIAL', priceWld: 1000, idempotencyKey: '11111111-1111-4111-8111-111111111111' }],
    ['/spaces/real-estate/land-001/rent', { dailyRentWld: 500, depositWld: 5000, idempotencyKey: '11111111-1111-4111-8111-111111111111' }],
    ['/spaces/real-estate/land-001/settle-rent', {}],
  ])('returns 503, not a synthetic financial receipt on POST %s', async (path, body) => {
    const response = await request(app.getHttpServer()).post(path).send(body).expect(503);
    expect(response.body.code).toBe('REAL_ESTATE_SOURCE_UNVERIFIED');
    expect(response.body).not.toHaveProperty('receipt');
    expect(response.body).not.toHaveProperty('settledAmountWld');
    expect(response.body).not.toHaveProperty('success');
  });

  it('never dispatches a purchase to an unverified financial service', () => {
    expect(service.purchaseSpace).not.toHaveBeenCalled();
    expect(service.listUserSpaces).not.toHaveBeenCalled();
    expect(service.getSpaceById).not.toHaveBeenCalled();
  });
});
