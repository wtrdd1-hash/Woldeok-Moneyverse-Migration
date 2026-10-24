import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';

// These guards are replaced only inside the isolated test module. The request
// still carries an actor session, so the controller cannot silently skip it.
describe('Star Drop authenticated HTTP refusal', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [DopamineController],
      providers: [{ provide: DopamineRepository, useValue: null }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: '11111111-2222-4333-8444-555555555555' };
      next();
    });
    await app.init();
  });

  afterAll(async () => app.close());

  it('responds 503/no-store without a WLD or inventory success receipt', async () => {
    const response = await request(app.getHttpServer())
      .post('/engagement/dopamine/star-drop')
      .send({ tapTier: 'mythic', idempotencyKey: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d' });
    expect(response.status).toBe(503);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.body).not.toHaveProperty('success', true);
    expect(response.body).not.toHaveProperty('rewardAmount');
  });
});
