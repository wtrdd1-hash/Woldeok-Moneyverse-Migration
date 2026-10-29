import { describe, expect, it } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { DopamineController } from './dopamine.controller';

const request = { session: { user_id: '11111111-2222-4333-8444-555555555555' } } as unknown as RequestWithSession;

describe('Pet Fortune evidence boundary', () => {
  it('does not advertise an unavailable WLD claim as eligible', async () => {
    const status = await new DopamineController(null).getDopamineStatus(request);
    expect(status.fortuneCookieAvailable).toBe(false);
  });
  for (const petAction of ['pet', 'fortune'] as const) {
    it(`rejects ${petAction} without a durable owner-scoped ledger receipt`, async () => {
      const controller = new DopamineController(null);
      await expect(controller.claimPetFortune(request, {
        petAction,
        idempotencyKey: 'd580efc9-2570-4f2c-a760-154965f58fa2',
      })).rejects.toMatchObject({
        status: 503,
        response: { code: 'PET_FORTUNE_SETTLEMENT_UNAVAILABLE' },
      });
    });
  }
});

import { afterAll, beforeAll } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import requestHttp from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { DopamineRepository } from './dopamine.repository';

describe('Pet Fortune authenticated HTTP boundary', () => {
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

  it('returns a non-cacheable 503 instead of a fabricated reward receipt', async () => {
    const response = await requestHttp(app.getHttpServer())
      .post('/engagement/dopamine/pet-fortune')
      .send({ petAction: 'fortune', idempotencyKey: 'd580efc9-2570-4f2c-a760-154965f58fa2' })
      .expect(503);
    expect(response.body).toMatchObject({ code: 'PET_FORTUNE_SETTLEMENT_UNAVAILABLE' });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.body).not.toHaveProperty('rewardAmount');
  });
});
