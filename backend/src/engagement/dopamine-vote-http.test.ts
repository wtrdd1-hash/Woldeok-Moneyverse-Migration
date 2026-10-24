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

describe('Bull/Bear vote HTTP containment', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const moduleRef = await Test.createTestingModule({
      controllers: [DopamineController],
      providers: [{ provide: DopamineRepository, useValue: null }],
    })
      .overrideGuard(SessionGuard).useValue(allow)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(CsrfGuard).useValue(allow)
      .compile();

    app = moduleRef.createNestApplication();
    app.use((req: { session?: { user_id: string } }, _res: unknown, next: () => void) => {
      req.session = { user_id: '11111111-2222-4333-8444-555555555555' };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each(['bull', 'bear'] as const)('returns 503 for %s instead of a fake success receipt', async (vote) => {
    const response = await request(app.getHttpServer())
      .post('/engagement/dopamine/bull-bear-vote')
      .send({ vote, stockSymbol: 'CHIPS' });
    expect(response.status).toBe(503);
    expect(JSON.stringify(response.body)).not.toContain('poolEligible');
    expect(JSON.stringify(response.body)).not.toContain('airdropPoolWld');
  });
});
