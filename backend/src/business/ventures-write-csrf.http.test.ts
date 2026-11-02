import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionRepository } from '../auth/session.repository';
import { VenturesController } from './ventures.controller';

const verifyCsrf = vi.fn(async (_session: string, token: string) => token === 'bound-token');
const writes = [
  { path: '/businesses/ventures/invest', body: { pitchId: 'pitch-1', amountWld: 10000, idempotencyKey: '11111111-1111-4111-8111-111111111111' } },
  { path: '/businesses/ventures/claim-dividend', body: { investmentId: 'inv-1', idempotencyKey: '11111111-1111-4111-8111-111111111111' } },
  { path: '/businesses/ventures/apply-founder', body: { startupName: 'Sample venture', sector: 'AI', targetFundingWld: 50000, equitySharePercent: 10, description: 'Test founder application', idempotencyKey: '11111111-1111-4111-8111-111111111111' } },
] as const;

describe('venture finance and founder write CSRF HTTP boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [VenturesController],
      providers: [
        { provide: SessionRepository, useValue: { verifyCsrf } },
        CsrfGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().session = { id: 'session-1', user_id: 'member-1' };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => { vi.clearAllMocks(); });

  for (const { path, body } of writes) {
    it(`${path} rejects missing CSRF before returning finance status`, async () => {
      await request(app.getHttpServer()).post(path).send(body).expect(403);
      expect(verifyCsrf).not.toHaveBeenCalled();
    });
    it(`${path} rejects a token not bound to the active session`, async () => {
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'wrong-token').send(body).expect(403);
      expect(verifyCsrf).toHaveBeenCalledWith('session-1', 'wrong-token');
    });
    it(`${path} keeps the existing finance hold with a valid CSRF`, async () => {
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'bound-token').send(body).expect(503);
      expect(verifyCsrf).toHaveBeenCalledWith('session-1', 'bound-token');
    });
  }
  it('keeps read-only venture evidence GET independent of CSRF', async () => {
    await request(app.getHttpServer()).get('/businesses/ventures/pitches').expect(503);
    expect(verifyCsrf).not.toHaveBeenCalled();
  });
});
