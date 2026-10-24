import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';

/** A real HTTP route with an authenticated fixture, but no database or payout function. */
describe('VIP chest HTTP contract', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixtureSession = {
      canActivate(context: ExecutionContext) {
        context.switchToHttp().getRequest().session = {
          user_id: '11111111-2222-4333-8444-555555555555',
        };
        return true;
      },
    };
    const allow = { canActivate: () => true };
    const builder = Test.createTestingModule({
      controllers: [DopamineController],
      providers: [{ provide: DopamineRepository, useValue: null }],
    });
    const moduleRef = await builder
      .overrideGuard(SessionGuard).useValue(fixtureSession)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(CsrfGuard).useValue(allow)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app.close(); });

  it('exposes only a private, unavailable VIP status to the signed-in member', async () => {
    const response = await request(app.getHttpServer()).get('/engagement/dopamine/vip-chest/status');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.body).toMatchObject({ available: false, isPlusUser: null, rewardAmount: '0' });
  });

  it('rejects reward claims with HTTP 503 instead of fabricating a transaction', async () => {
    const response = await request(app.getHttpServer()).post('/engagement/dopamine/vip-chest').send({});
    expect(response.status).toBe(503);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.body).not.toHaveProperty('success', true);
    expect(response.body).not.toHaveProperty('rewardAmount', 2000);
  });
});
