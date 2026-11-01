import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionRepository } from '../auth/session.repository';
import { HotTimeController } from './hot-time.controller';
import { HotTimeService } from './hot-time.service';

const toggleHotTime = vi.fn().mockRejectedValue(new ServiceUnavailableException('hot-time write unavailable'));
const getActiveHotTimes = vi.fn().mockResolvedValue({ activeBuffs: [], hasActiveHotTime: false, serverTime: '2026-11-02T00:00:00.000Z' });
const verifyCsrf = vi.fn().mockImplementation(async (sessionId: string, token: string) =>
  sessionId === 'hot-time-admin-session' && token === 'valid-hot-time-csrf',
);
const touchAdminSession = vi.fn().mockResolvedValue({ state: 'open' });
const hasCurrentUserConsent = vi.fn().mockResolvedValue(true);

/** Real Nest guard-chain HTTP test; only identity and admin role are fixtures. */
describe('P1 hot-time administrator write security boundary', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [HotTimeController],
      providers: [
        { provide: HotTimeService, useValue: { toggleHotTime, getActiveHotTimes } },
        { provide: SessionRepository, useValue: { verifyCsrf, touchAdminSession, hasCurrentUserConsent } },
        AdminSessionGuard,
        ConsentGuard,
        CsrfGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().session = { id: 'hot-time-admin-session', user_id: 'admin-1' };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });
  beforeEach(() => {
    vi.clearAllMocks();
    touchAdminSession.mockResolvedValue({ state: 'open' });
    hasCurrentUserConsent.mockResolvedValue(true);
  });

  const toggle = () => request(app.getHttpServer()).patch('/economy/hot-time/toggle')
    .send({ buffKey: 'WORK_SALARY_BOOST_150', active: true });

  it('rejects a missing CSRF token before reaching the service', async () => {
    await toggle().expect(403);
    expect(toggleHotTime).not.toHaveBeenCalled();
  });

  it('rejects a token belonging to a different session', async () => {
    await toggle().set('x-csrf-token', 'other-session').expect(403);
    expect(verifyCsrf).toHaveBeenCalledWith('hot-time-admin-session', 'other-session');
    expect(toggleHotTime).not.toHaveBeenCalled();
  });

  it('retains the existing fail-closed ledger HOLD with valid same-session CSRF', async () => {
    await toggle().set('x-csrf-token', 'valid-hot-time-csrf').expect(503);
    expect(toggleHotTime).toHaveBeenCalledOnce();
  });

  it('rejects locked administrator console sessions before CSRF', async () => {
    touchAdminSession.mockResolvedValue({ state: 'idle_locked' });
    await toggle().set('x-csrf-token', 'valid-hot-time-csrf').expect(401);
    expect(verifyCsrf).not.toHaveBeenCalled();
    expect(toggleHotTime).not.toHaveBeenCalled();
  });

  it('requires current consent before mutation', async () => {
    hasCurrentUserConsent.mockResolvedValue(false);
    await toggle().set('x-csrf-token', 'valid-hot-time-csrf').expect(428);
    expect(toggleHotTime).not.toHaveBeenCalled();
  });

  it('keeps public active-buff GET available without a CSRF token', async () => {
    await request(app.getHttpServer()).get('/economy/hot-time/active').expect(200);
    expect(getActiveHotTimes).toHaveBeenCalledOnce();
    expect(verifyCsrf).not.toHaveBeenCalled();
  });
});
