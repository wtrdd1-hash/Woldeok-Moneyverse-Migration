import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import { ServiceUnavailableException, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AdminFxController, PublicFxController } from './fx.controller';
import { FxService } from './fx.service';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SessionRepository } from '../../auth/session.repository';

const verifyCsrf = vi.fn(async (_session: string, token: string) => token === 'same-session-token');
const touchAdminSession = vi.fn(async () => ({ state: 'open' }));
const financialHold = () => { throw new ServiceUnavailableException('financial settlement held'); };
const intervene = vi.fn(financialHold);
const drawdownCurrencySwap = vi.fn(financialHold);
const settleForwardContract = vi.fn(financialHold);
const setHalt = vi.fn(financialHold);
const createForwardContract = vi.fn(financialHold);
const swapWldToUsd = vi.fn(financialHold);
const swapUsdToWld = vi.fn(financialHold);
const writes = [intervene, drawdownCurrencySwap, settleForwardContract, setHalt, createForwardContract, swapWldToUsd, swapUsdToWld];
const adminPaths = [
  ['/api/v1/admin/fx/intervene', { type: 'SELL_USD', amountUsd: 100 }],
  ['/api/v1/admin/fx/swaps/drawdown', { agreementId: 'agreement', amountUsd: 100 }],
  ['/api/v1/admin/fx/forward/settle', { contractId: 'contract' }],
  ['/api/v1/admin/fx/halt', { isHalted: true }],
] as const;
const memberPaths = [
  ['/api/v1/fx/forward/contract', { position: 'BUY_USD', tenor: '1M', contractAmountUsd: 100 }],
  ['/api/v1/fx/swap/wld-to-usd', { wldAmount: 100 }],
  ['/api/v1/fx/swap/usd-to-wld', { usdAmount: 100 }],
] as const;

describe('FX financial writes enforce session-bound CSRF and admin console boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AdminFxController, PublicFxController],
      providers: [
        { provide: FxService, useValue: {
          executeSmoothingIntervention: intervene, drawdownCurrencySwap, settleForwardContract,
          setHalt, createForwardContract, swapWldToUsd, swapUsdToWld,
          getReserveStatus: vi.fn(async () => ({})), getRateHistory: vi.fn(async () => []),
          listTransactions: vi.fn(async () => []), getSdrAllocations: vi.fn(async () => []),
          getSwapAgreements: vi.fn(async () => []), listAllForwardContracts: vi.fn(async () => []),
          getEarlyWarningStatus: vi.fn(async () => ({})),
        } },
        { provide: SessionRepository, useValue: { verifyCsrf, touchAdminSession } },
        CsrfGuard, AdminSessionGuard,
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (ctx: ExecutionContext) => {
        ctx.switchToHttp().getRequest().session = { id: 'session-1', user_id: 'admin-1' };
        return true;
      } })
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

  for (const [path, body] of adminPaths) {
    it(`${path} denies missing/invalid CSRF before any financial service call`, async () => {
      await request(app.getHttpServer()).post(path).send(body).expect(403);
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'wrong-token').send(body).expect(403);
      for (const write of writes) expect(write).not.toHaveBeenCalled();
    });
    it(`${path} rejects a closed admin console even with valid CSRF`, async () => {
      touchAdminSession.mockResolvedValue({ state: 'missing' });
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'same-session-token').send(body).expect(403);
      for (const write of writes) expect(write).not.toHaveBeenCalled();
    });
    it(`${path} reaches only existing fail-closed service with valid admin console and CSRF`, async () => {
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'same-session-token').send(body).expect(503);
      expect(touchAdminSession).toHaveBeenCalledWith('session-1', 'admin-1');
      expect(verifyCsrf).toHaveBeenCalledWith('session-1', 'same-session-token');
    });
  }
  for (const [path, body] of memberPaths) {
    it(`${path} denies missing/invalid CSRF before financial service`, async () => {
      await request(app.getHttpServer()).post(path).send(body).expect(403);
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'wrong-token').send(body).expect(403);
      for (const write of writes) expect(write).not.toHaveBeenCalled();
    });
    it(`${path} preserves fail-closed service response for valid CSRF without admin console`, async () => {
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'same-session-token').send(body).expect(503);
      expect(verifyCsrf).toHaveBeenCalledWith('session-1', 'same-session-token');
      expect(touchAdminSession).not.toHaveBeenCalled();
    });
  }
  it('preserves safe authenticated admin GET without CSRF or console touch', async () => {
    await request(app.getHttpServer()).get('/api/v1/admin/fx/status').expect(200);
    expect(verifyCsrf).not.toHaveBeenCalled();
    expect(touchAdminSession).not.toHaveBeenCalled();
  });
});
