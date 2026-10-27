import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Queryable } from '../../core/db';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CentralBankService } from './central-bank.service';
import { MintBureauService } from './mint-bureau.service';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';
import { MonetaryController } from './monetary.controller';

describe('Admin monetary telemetry HTTP evidence contract', () => {
  let app: INestApplication;
  let allowAdmin = true;
  const query = vi.fn();

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [MonetaryController],
      providers: [
        { provide: CentralBankService, useValue: new CentralBankService({ query } as unknown as Queryable) },
        { provide: MintBureauService, useValue: {} },
        { provide: AutoMonetaryRegulationService, useValue: {} },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => allowAdmin })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('rejects a non-admin before financial telemetry queries', async () => {
    query.mockReset();
    allowAdmin = false;
    await request(app.getHttpServer()).get('/admin/economy/monetary/telemetry').expect(403);
    expect(query).not.toHaveBeenCalled();
    allowAdmin = true;
  });

  it('returns 503 and no false zeroes when the counts query is denied', async () => {
    query.mockReset()
      .mockResolvedValueOnce({ rows: [{ treasury_wld: '100', user_balances_wld: '200', is_issuance_frozen: true }] })
      .mockRejectedValueOnce(new Error('42501 permission denied'));
    const response = await request(app.getHttpServer()).get('/admin/economy/monetary/telemetry').expect(503);
    expect(response.body.message).toBe('monetary telemetry evidence unavailable');
    expect(response.body).not.toHaveProperty('m_total');
  });

  it('returns measured financial amounts and explicit nulls, never a false reconciliation receipt', async () => {
    query.mockReset()
      .mockResolvedValueOnce({ rows: [{ treasury_wld: '100', user_balances_wld: '200', is_issuance_frozen: false }] })
      .mockResolvedValueOnce({ rows: [{ active_orders: '0', mints: '0', retirements: '0' }] });
    const response = await request(app.getHttpServer()).get('/admin/economy/monetary/telemetry').expect(200);
    expect(response.body).toMatchObject({
      m_total: '300', is_issuance_frozen: false, active_policy_orders_count: 0,
      m_bank_liquidity: null, m_locked: null, verified_invariant: false, last_reconciled_at: null,
    });
  });
});
