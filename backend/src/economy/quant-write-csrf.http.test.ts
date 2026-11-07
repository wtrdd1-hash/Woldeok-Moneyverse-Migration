import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { QuantController } from './quant.controller';
import { SessionGuard } from '../auth/guards/session.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionRepository } from '../auth/session.repository';

const verifyCsrf = vi.fn(async (sessionId: string, token: string) =>
  sessionId === 'quant-session' && token === 'session-bound-token');
const hasCurrentUserConsent = vi.fn(async () => true);
const writes = [
  { path: '/quant/strategies', body: { name: 'RSI Strategy' } },
  { path: '/quant/backtest', body: { targetTicker: 'TEST', periodDays: 30, ruleLogic: {}, initialCapitalWld: 1000 } },
  { path: '/quant/strategies/strategy-1/toggle', body: {} },
] as const;

describe('quant member HTTP CSRF boundary', () => {
  let app: INestApplication;
  let authenticated = true;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [QuantController],
      providers: [
        { provide: SessionRepository, useValue: { verifyCsrf, hasCurrentUserConsent } },
        ConsentGuard,
        CsrfGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().session = {
            id: 'quant-session',
            user_id: authenticated ? '00000000-0000-4000-8000-000000000001' : undefined,
          };
          return true;
        },
      })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => {
    authenticated = true;
    vi.clearAllMocks();
    hasCurrentUserConsent.mockResolvedValue(true);
  });

  for (const { path, body } of writes) {
    it(`${path} denies missing and mismatched CSRF before entering the handler`, async () => {
      await request(app.getHttpServer()).post(path).send(body).expect(403);
      await request(app.getHttpServer()).post(path)
        .set('x-csrf-token', 'other-session-token').send(body).expect(403);
      expect(verifyCsrf).toHaveBeenCalledExactlyOnceWith('quant-session', 'other-session-token');
    });
    it(`${path} retains the financial evidence hold after a valid same-session CSRF`, async () => {
      const response = await request(app.getHttpServer()).post(path)
        .set('x-csrf-token', 'session-bound-token').send(body).expect(503);
      expect(verifyCsrf).toHaveBeenCalledExactlyOnceWith('quant-session', 'session-bound-token');
      expect(JSON.stringify(response.body)).not.toMatch(/created|executed|paid|success/i);
    });
    it(`${path} requires current consent before CSRF or handler execution`, async () => {
      hasCurrentUserConsent.mockResolvedValue(false);
      await request(app.getHttpServer()).post(path)
        .set('x-csrf-token', 'session-bound-token').send(body).expect(428);
      expect(verifyCsrf).not.toHaveBeenCalled();
    });
  }

  it('keeps member GET evidence read-only and CSRF-free', async () => {
    const response = await request(app.getHttpServer()).get('/quant/strategies').expect(503);
    expect(response.body.code).toBe('QUANT_EVIDENCE_UNAVAILABLE');
    expect(verifyCsrf).not.toHaveBeenCalled();
  });
  it('rejects anonymous writes before CSRF', async () => {
    authenticated = false;
    await request(app.getHttpServer()).post('/quant/backtest')
      .set('x-csrf-token', 'session-bound-token').send({}).expect(401);
    expect(verifyCsrf).not.toHaveBeenCalled();
  });
});
