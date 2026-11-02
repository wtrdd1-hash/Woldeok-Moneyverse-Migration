import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CentralBankController } from './central-bank.controller';
import { CentralBankService } from './central-bank.service';
import { DurableCentralBankPolicyService } from './durable-policy.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const baseRate = { baseRatePercent: '4.25', rateDecisionRationale: 'Verified policy decision', targetInflationPercent: '2.00' };
const reserve = { reserveRatioPercent: '8.00', regulationRationale: 'Verified liquidity policy' };

describe('central bank administrator console session HTTP boundary', () => {
  let app: INestApplication;
  let state: 'missing' | 'locked' | 'open';
  const touchAdmin = vi.fn();
  const updateBaseRate = vi.fn().mockResolvedValue({ source: 'persistent_monetary_policy', ratePercent: '4.25' });
  const updateReserveRequirement = vi.fn().mockResolvedValue({ source: 'persistent_monetary_policy', ratioPercent: '8.00' });
  const getBaseRate = vi.fn().mockResolvedValue({ ratePercent: '4.25' });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [CentralBankController],
      providers: [
        { provide: CentralBankService, useValue: {} },
        { provide: DurableCentralBankPolicyService, useValue: { updateBaseRate, updateReserveRequirement, getBaseRate } },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: (context: { switchToHttp: () => { getRequest: () => { session?: unknown } } }) => {
        context.switchToHttp().getRequest().session = { id: 'session-1', user_id: ACTOR };
        return true;
      } })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => {
        touchAdmin();
        if (state === 'missing') throw new ForbiddenException('administrator session required');
        if (state === 'locked') throw new UnauthorizedException('administrator session is locked');
        return true;
      } })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });
  beforeEach(() => {
    state = 'missing';
    touchAdmin.mockClear();
    updateBaseRate.mockClear();
    updateReserveRequirement.mockClear();
  });

  it.each([
    ['PUT', '/central-bank/base-rate', baseRate],
    ['PUT', '/central-bank/reserve-requirement', reserve],
    ['POST', '/central-bank/mint-batches/22222222-2222-4222-8222-222222222222/accept', {}],
  ] as const)('refuses %s %s without an open console session before any policy write', async (method, path, body) => {
    const res = method === 'PUT'
      ? await request(app.getHttpServer()).put(path).send(body)
      : await request(app.getHttpServer()).post(path).send(body);
    expect(res.status).toBe(403);
    expect(touchAdmin).toHaveBeenCalledOnce();
    expect(updateBaseRate).not.toHaveBeenCalled();
    expect(updateReserveRequirement).not.toHaveBeenCalled();
  });

  it.each([
    ['/central-bank/base-rate', baseRate],
    ['/central-bank/reserve-requirement', reserve],
  ] as const)('refuses locked administrator console on %s with HTTP 401', async (path, body) => {
    state = 'locked';
    await request(app.getHttpServer()).put(path).send(body).expect(401);
    expect(touchAdmin).toHaveBeenCalledOnce();
    expect(updateBaseRate).not.toHaveBeenCalled();
    expect(updateReserveRequirement).not.toHaveBeenCalled();
  });

  it('allows a verified open console session to update policy without changing the response contract', async () => {
    state = 'open';
    const rate = await request(app.getHttpServer()).put('/central-bank/base-rate').send(baseRate).expect(200);
    const ratio = await request(app.getHttpServer()).put('/central-bank/reserve-requirement').send(reserve).expect(200);
    expect(rate.body.ratePercent).toBe('4.25');
    expect(ratio.body.ratioPercent).toBe('8.00');
    expect(updateBaseRate).toHaveBeenCalledWith(baseRate, ACTOR);
    expect(updateReserveRequirement).toHaveBeenCalledWith(reserve, ACTOR);
    expect(touchAdmin).toHaveBeenCalledTimes(2);
  });

  it('keeps read-only public base rate independent of admin console', async () => {
    await request(app.getHttpServer()).get('/central-bank/base-rate').expect(200);
    expect(getBaseRate).toHaveBeenCalled();
    expect(touchAdmin).not.toHaveBeenCalled();
  });
});
