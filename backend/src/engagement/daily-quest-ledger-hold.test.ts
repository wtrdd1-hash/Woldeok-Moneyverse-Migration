import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import type { RequestWithSession } from '../auth/session.context';
import { DopamineController } from './dopamine.controller';
import { DopamineRepository } from './dopamine.repository';

const USER = '11111111-2222-4333-8444-555555555555';
const KEY = '22222222-3333-4444-8555-666666666666';
const BODY = { questId: 'quest_financial_quiz', idempotencyKey: KEY };
const requestWithSession = { session: { user_id: USER } } as unknown as RequestWithSession;

describe('daily quest ledger settlement hold', () => {
  const claimDailyQuest = vi.fn().mockResolvedValue({
    success: true, userId: USER, questId: BODY.questId,
    transactionId: KEY, rewardAmount: 1000, newBalance: '1000', claimedAt: new Date().toISOString(),
  });
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [DopamineController],
      providers: [{ provide: DopamineRepository, useValue: { claimDailyQuest } }],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    app.use((req: { session?: unknown }, _res: unknown, next: () => void) => {
      req.session = { user_id: USER };
      next();
    });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('rejects an authenticated HTTP reward claim before repository writes', async () => {
    claimDailyQuest.mockClear();
    const response = await request(app.getHttpServer())
      .post('/engagement/dopamine/daily-quest/claim')
      .send(BODY)
      .expect(503);
    expect(response.body.code).toBe('DAILY_QUEST_SETTLEMENT_UNAVAILABLE');
    expect(claimDailyQuest).not.toHaveBeenCalled();
  });

  it('does not fabricate success when the repository is absent', async () => {
    const controller = new DopamineController(null);
    await expect(controller.claimDailyQuest(requestWithSession, BODY))
      .rejects.toMatchObject({ status: 503 });
  });

  it('does not expose a fabricated empty reward history when the repository is absent', async () => {
    const controller = new DopamineController(null);
    await expect(controller.getDailyQuestStatus(requestWithSession))
      .rejects.toMatchObject({ status: 503 });
  });

  it('refuses direct repository claims before any SQL (including replays)', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new DopamineRepository({ query } as never);
    await expect(repository.claimDailyQuest({ actorUserId: USER, idempotencyKey: KEY, questId: BODY.questId }))
      .rejects.toThrow('DAILY_QUEST_SETTLEMENT_UNAVAILABLE');
    expect(query).not.toHaveBeenCalled();
  });
});
