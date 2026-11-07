import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import requestHttp from 'supertest';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';

describe('Star Drop authenticated HTTP boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [DopamineController],
      providers: [{ provide: DopamineRepository, useValue: {} }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: '11111111-2222-4333-8444-555555555555' };
      next();
    });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('never returns a reward receipt and protects every response', async () => {
    const response = await requestHttp(app.getHttpServer())
      .post('/engagement/dopamine/star-drop')
      .send({ tapTier: 'legendary', idempotencyKey: 'd580efc9-2570-4f2c-a760-154965f58fa2' })
      .expect(503);
    expect(response.body).toMatchObject({ code: 'STAR_DROP_SETTLEMENT_UNAVAILABLE' });
    expect(response.body).not.toHaveProperty('rewardAmount');
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex, nofollow');
  });
});
