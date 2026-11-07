import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { QuantController } from './quant.controller';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionRepository } from '../auth/session.repository';

describe('quant authenticated HTTP evidence boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [QuantController],
      providers: [
        CsrfGuard,
        {
          provide: SessionRepository,
          useValue: {
            verifyCsrf: async (id: string, token: string) =>
              id === 'quant-test-session' && token === 'valid-test-token',
          },
        },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { id: 'quant-test-session', user_id: '00000000-0000-4000-8000-000000000001' };
      next();
    });
    await app.init();
  });
  afterAll(async () => { if (app) await app.close(); });
  it.each([
    ['get', '/quant/strategies'],
    ['get', '/quant/strategies/not-owned/logs'],
    ['post', '/quant/backtest'],
  ] as const)('%s %s refuses invented financial results without cache', async (method, path) => {
    const httpRequest = request(app.getHttpServer())[method](path);
    if (method === 'post') httpRequest.set('x-csrf-token', 'valid-test-token');
    const response = await httpRequest
      .send(method === 'post' ? { targetTicker: 'UNKNOWN', periodDays: 30, ruleLogic: {}, initialCapitalWld: 10000000 } : undefined);
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('QUANT_EVIDENCE_UNAVAILABLE');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(JSON.stringify(response.body)).not.toMatch(/485000|18\.75|log-001/);
  });
});
