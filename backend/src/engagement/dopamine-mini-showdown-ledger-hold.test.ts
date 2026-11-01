import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import requestHttp from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import type { RequestWithSession } from '../auth/session.context';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';

const USER = '11111111-2222-4333-8444-555555555555';
const memberRequest = { session: { user_id: USER } } as unknown as RequestWithSession;
const forgedWin = { outcome: 'win' as const, playerRoll: [6, 6], aiRoll: [1, 1], stake: 1000000000 };

describe('P0 mini-showdown settlement integrity', () => {
  it('refuses a client-chosen win and billion-WLD stake without a ledger receipt', async () => {
    await expect(new DopamineController(null).resolveMiniShowdown(memberRequest, forgedWin)).rejects.toMatchObject({
      status: 503,
      response: { code: 'MINI_SHOWDOWN_SETTLEMENT_UNAVAILABLE' },
    });
  });

  it('rejects fabricated loss as well, rather than confirming a stake debit that never happened', async () => {
    await expect(new DopamineController(null).resolveMiniShowdown(memberRequest, {
      outcome: 'loss', playerRoll: [1], aiRoll: [6], stake: 100,
    })).rejects.toMatchObject({ status: 503 });
  });

  it('does not query or mutate the repository for an unverified payout', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const controller = new DopamineController({ pool: { query } } as unknown as DopamineRepository);
    await expect(controller.resolveMiniShowdown(memberRequest, forgedWin)).rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });
});

describe('P0 mini-showdown authenticated HTTP boundary', () => {
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
      req.session = { user_id: USER };
      next();
    });
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  afterAll(async () => app?.close());

  it('never returns HTTP 200, a payout or a fake transaction for client-controlled dice', async () => {
    const response = await requestHttp(app.getHttpServer())
      .post('/api/v1/engagement/dopamine/mini-showdown').send(forgedWin);
    expect(response.status).toBe(503);
    expect(response.body).toMatchObject({ code: 'MINI_SHOWDOWN_SETTLEMENT_UNAVAILABLE' });
    expect(response.body).not.toHaveProperty('payout');
    expect(response.body).not.toHaveProperty('transactionId');
    expect(response.body).not.toHaveProperty('success', true);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });
});
