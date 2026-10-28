import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';

describe('VIP chest authenticated HTTP containment', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const builder = Test.createTestingModule({
      controllers: [DopamineController],
      providers: [{ provide: DopamineRepository, useValue: null }],
    });
    for (const guard of [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]) {
      builder.overrideGuard(guard).useValue({ canActivate: () => true });
    }
    const moduleRef = await builder.compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: '11111111-1111-4111-8111-111111111111' };
      next();
    });
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  afterAll(async () => app?.close());

  it('returns explicit unavailable state instead of a Plus entitlement or receipt', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/engagement/dopamine/vip-chest/status');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ available: false, isPlusUser: null, claimedToday: null, rewardAmount: '0', diceAwarded: 0 });
  });
  it('rejects reward claim POST with HTTP 503, never 200 or a fabricated transaction', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/engagement/dopamine/vip-chest');
    expect(response.status).toBe(503);
    expect(response.body).not.toHaveProperty('success', true);
    expect(response.body).not.toHaveProperty('transactionId');
  });
});
