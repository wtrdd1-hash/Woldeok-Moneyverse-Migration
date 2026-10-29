import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AdminTreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';

const SWF_HOLD = 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE';

describe('v641 SWF manual execution HTTP ledger gate', () => {
  let app: INestApplication;
  const evaluateAndRebalance = vi.fn();
  const liquidateToTreasuryVault = vi.fn();

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AdminTreasuryController],
      providers: [
        { provide: TreasuryService, useValue: {} },
        { provide: AutoSovereignWealthFundService, useValue: { evaluateAndRebalance, liquidateToTreasuryVault } },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it.each(['rebalance', 'liquidate'] as const)('%s refuses unverified financial execution before service dispatch', async (action) => {
    const response = await request(app.getHttpServer())
      .post(`/admin/treasury/swf/${action}`)
      .send(action === 'liquidate' ? { targetPortfolioAumWld: '20000000' } : {})
      .expect(503);
    expect(response.body).toMatchObject({ code: SWF_HOLD });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(evaluateAndRebalance).not.toHaveBeenCalled();
    expect(liquidateToTreasuryVault).not.toHaveBeenCalled();
  });
});
