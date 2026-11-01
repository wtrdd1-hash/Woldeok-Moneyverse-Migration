import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SessionRepository } from '../../auth/session.repository';
import { AdminNationalPensionController } from './national-pension.controller';
import { NationalPensionService } from './national-pension.service';

const payout = vi.fn().mockRejectedValue(new ServiceUnavailableException('pension ledger settlement unavailable'));
const verifyCsrf = vi.fn().mockImplementation(async (sessionId: string, token: string) =>
  sessionId === 'admin-session-1' && token === 'valid-admin-csrf',
);
const touchAdminSession = vi.fn().mockResolvedValue({ state: 'open' });
const hasCurrentUserConsent = vi.fn().mockResolvedValue(true);
const getOverview = vi.fn().mockResolvedValue({ fund: 'verified' });

/** Guard-chain HTTP test: session/consent/console checks remain real; only identity and roles are fixtures. */
describe('P1 admin pension payout HTTP CSRF boundary', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AdminNationalPensionController],
      providers: [
        { provide: NationalPensionService, useValue: { distributeHourlyPensionPayouts: payout, getOverview } },
        { provide: SessionRepository, useValue: { verifyCsrf, touchAdminSession, hasCurrentUserConsent } },
        AdminSessionGuard,
        ConsentGuard,
        CsrfGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().session = { id: 'admin-session-1', user_id: 'admin-1' };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });
  beforeEach(() => {
    vi.clearAllMocks();
    hasCurrentUserConsent.mockResolvedValue(true);
    touchAdminSession.mockResolvedValue({ state: 'open' });
  });

  it('rejects missing CSRF before the financial service is reached', async () => {
    await request(app.getHttpServer()).post('/admin/pension/distribute-payouts').expect(403);
    expect(payout).not.toHaveBeenCalled();
  });

  it('rejects invalid CSRF for the active console session', async () => {
    await request(app.getHttpServer()).post('/admin/pension/distribute-payouts')
      .set('x-csrf-token', 'another-session').expect(403);
    expect(verifyCsrf).toHaveBeenCalledWith('admin-session-1', 'another-session');
    expect(payout).not.toHaveBeenCalled();
  });

  it('keeps the ledger settlement HOLD even with valid same-session CSRF', async () => {
    await request(app.getHttpServer()).post('/admin/pension/distribute-payouts')
      .set('x-csrf-token', 'valid-admin-csrf').expect(503);
    expect(payout).toHaveBeenCalledOnce();
  });

  it('blocks locked administrator console sessions before CSRF or payout', async () => {
    touchAdminSession.mockResolvedValue({ state: 'idle_locked' });
    await request(app.getHttpServer()).post('/admin/pension/distribute-payouts')
      .set('x-csrf-token', 'valid-admin-csrf').expect(401);
    expect(payout).not.toHaveBeenCalled();
    expect(verifyCsrf).not.toHaveBeenCalled();
  });

  it('requires current consent before CSRF or payout', async () => {
    hasCurrentUserConsent.mockResolvedValue(false);
    await request(app.getHttpServer()).post('/admin/pension/distribute-payouts')
      .set('x-csrf-token', 'valid-admin-csrf').expect(428);
    expect(payout).not.toHaveBeenCalled();
  });

  it('keeps the read-only overview accessible without a CSRF token', async () => {
    await request(app.getHttpServer()).get('/admin/pension/overview').expect(200);
    expect(getOverview).toHaveBeenCalledOnce();
  });
});
