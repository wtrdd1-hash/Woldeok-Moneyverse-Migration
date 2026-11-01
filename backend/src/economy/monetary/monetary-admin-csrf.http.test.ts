import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { SessionRepository } from '../../auth/session.repository';
import { CentralBankService } from './central-bank.service';
import { MintBureauService } from './mint-bureau.service';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';
import { MonetaryController } from './monetary.controller';

const verifyCsrf = vi.fn(async (_session: string, token: string) => token === 'same-session-token');
const touchAdminSession = vi.fn(async () => ({ state: 'open' }));
const proposeFromAiCouncil = vi.fn(async () => ({ id: 'proposed-ai' }));
const proposePolicyOrder = vi.fn(async () => ({ id: 'proposed-order' }));
const approvePolicyOrder = vi.fn(async () => ({ id: 'approved-order' }));
const freezeIssuance = vi.fn(async () => ({ frozen: true }));
const unfreezeIssuance = vi.fn(async () => ({ frozen: false }));
const updateConfig = vi.fn(async () => ({ is_enabled: false }));
const operations = [proposeFromAiCouncil, proposePolicyOrder, approvePolicyOrder, freezeIssuance, unfreezeIssuance, updateConfig];

const mutations = [
  { path: '/admin/economy/monetary/auto-regulation/update', body: { is_enabled: false } },
  { path: '/admin/economy/monetary/auto-regulation/run', body: {} },
  { path: '/admin/economy/monetary/ai-council/propose-policy', body: {} },
  { path: '/admin/economy/monetary/orders/propose', body: { order_type: 'MINT', target_envelope: 'TREASURY', max_amount_wld: '100', reason: 'verified test' } },
  { path: '/admin/economy/monetary/orders/order-1/approve', body: {} },
  { path: '/admin/economy/monetary/freeze', body: { reason: 'emergency' } },
  { path: '/admin/economy/monetary/unfreeze', body: {} },
  { path: '/admin/economy/monetary/execute-mint', body: { policy_order_id: 'order-1', amount_wld: '100', idempotency_key: 'id-1' } },
] as const;

describe('admin monetary policy HTTP CSRF and open console boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [MonetaryController],
      providers: [
        { provide: CentralBankService, useValue: {
          proposeFromAiCouncil, proposePolicyOrder, approvePolicyOrder, freezeIssuance, unfreezeIssuance,
          getMonetaryTelemetry: vi.fn(async () => ({ verified: true })),
        } },
        { provide: MintBureauService, useValue: {} },
        { provide: AutoMonetaryRegulationService, useValue: { updateConfig } },
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
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => {
    vi.clearAllMocks();
    touchAdminSession.mockResolvedValue({ state: 'open' });
  });

  for (const { path, body } of mutations) {
    it(`${path} rejects missing and invalid CSRF before a monetary operation`, async () => {
      await request(app.getHttpServer()).post(path).send(body).expect(403);
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'wrong-session-token').send(body).expect(403);
      for (const operation of operations) expect(operation).not.toHaveBeenCalled();
    });
    it(`${path} rejects a missing administrator console session`, async () => {
      touchAdminSession.mockResolvedValue({ state: 'missing' });
      await request(app.getHttpServer()).post(path).set('x-csrf-token', 'same-session-token').send(body).expect(403);
      for (const operation of operations) expect(operation).not.toHaveBeenCalled();
    });
  }

  it('allows a verified same-session console request to propose a policy without executing money movement', async () => {
    await request(app.getHttpServer()).post('/admin/economy/monetary/ai-council/propose-policy')
      .set('x-csrf-token', 'same-session-token').send({}).expect(201);
    expect(touchAdminSession).toHaveBeenCalledWith('session-1', 'admin-1');
    expect(verifyCsrf).toHaveBeenCalledWith('session-1', 'same-session-token');
    expect(proposeFromAiCouncil).toHaveBeenCalledExactlyOnceWith('admin-1');
  });

  it('preserves safe authenticated GET without CSRF token', async () => {
    await request(app.getHttpServer()).get('/admin/economy/monetary/telemetry').expect(200);
    expect(verifyCsrf).not.toHaveBeenCalled();
  });
});
