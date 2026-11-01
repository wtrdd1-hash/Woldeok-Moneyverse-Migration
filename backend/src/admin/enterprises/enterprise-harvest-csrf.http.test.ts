import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AdminEnterpriseController } from './enterprise.controller';
import { EnterpriseService } from './enterprise.service';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SessionRepository } from '../../auth/session.repository';

const verifyCsrf = vi.fn(async (_session: string, token: string) => token === 'bound-token');
const touchAdminSession = vi.fn(async () => ({ state: 'open' }));
const harvestSoeDividends = vi.fn(async () => {
  throw new ServiceUnavailableException('SOE_DIVIDEND_LEDGER_UNAVAILABLE');
});
const getStateHoldingOverview = vi.fn(async () => ({ verified: true }));

// An admin console session is necessary but not sufficient for a financial POST.
describe('SOE dividend harvest session-bound CSRF', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminEnterpriseController],
      providers: [
        { provide: EnterpriseService, useValue: { harvestSoeDividends, getStateHoldingOverview } },
        { provide: SessionRepository, useValue: { verifyCsrf, touchAdminSession } },
        CsrfGuard,
        AdminSessionGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: ExecutionContext) => {
          ctx.switchToHttp().getRequest().session = { id: 'session-1', user_id: 'admin-1' };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });
  beforeEach(() => {
    vi.clearAllMocks();
    touchAdminSession.mockResolvedValue({ state: 'open' });
  });

  const path = '/api/v1/admin/enterprises/soes/harvest';

  it('rejects absent CSRF without reaching the financial service', async () => {
    await request(app.getHttpServer()).post(path).send({}).expect(403);
    expect(harvestSoeDividends).not.toHaveBeenCalled();
  });

  it('rejects a mismatched session CSRF token', async () => {
    await request(app.getHttpServer()).post(path).set('x-csrf-token', 'wrong-token').send({}).expect(403);
    expect(harvestSoeDividends).not.toHaveBeenCalled();
  });

  it('requires an open admin console even with valid CSRF', async () => {
    touchAdminSession.mockResolvedValue({ state: 'missing' });
    await request(app.getHttpServer()).post(path).set('x-csrf-token', 'bound-token').send({}).expect(403);
    expect(harvestSoeDividends).not.toHaveBeenCalled();
  });

  it('preserves the ledger-unavailable hold for authorized requests', async () => {
    await request(app.getHttpServer()).post(path).set('x-csrf-token', 'bound-token').send({}).expect(503);
    expect(touchAdminSession).toHaveBeenCalledWith('session-1', 'admin-1');
    expect(verifyCsrf).toHaveBeenCalledWith('session-1', 'bound-token');
    expect(harvestSoeDividends).toHaveBeenCalledWith('admin-1');
  });

  it('keeps the safe admin overview GET accessible without CSRF', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/enterprises/overview').expect(200);
    expect(verifyCsrf).not.toHaveBeenCalled();
  });
});
