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
import { CsrfGuard } from '../../auth/guards/csrf.guard';

describe('v641 SWF manual execution canonical ledger dispatch', () => {
  let app: INestApplication;
  const mockReceipt = {
    success: true,
    code: 'SWF_LIQUIDATION_SETTLED',
    liquidated_wld: '181056162',
    vault_main_balance: '185055982',
    ledger_transaction_id: 'a0000000-0000-0000-0000-000000000001',
  };
  const evaluateAndRebalance = vi.fn().mockResolvedValue({ executed: true, reason: 'SWF_EVALUATED_AND_REBALANCED' });
  const liquidateToTreasuryVault = vi.fn().mockResolvedValue(mockReceipt);

  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [AdminTreasuryController],
      providers: [
        { provide: TreasuryService, useValue: {} },
        { provide: AutoSovereignWealthFundService, useValue: { evaluateAndRebalance, liquidateToTreasuryVault } },
      ],
    })
      .overrideGuard(SessionGuard).useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.session = { user_id: '00000000-0000-0000-0000-000000000001', role: 'superadmin' };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue({ canActivate: () => true })
      .compile();
    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('dispatches rebalance to service and returns result', async () => {
    const response = await request(app.getHttpServer())
      .post('/admin/treasury/swf/rebalance')
      .expect(201);
    expect(response.body).toMatchObject({ executed: true });
    expect(response.headers['cache-control']).toBe('no-store');
    expect(evaluateAndRebalance).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000001');
  });

  it('dispatches liquidation to service with target AUM and returns settled receipt', async () => {
    const response = await request(app.getHttpServer())
      .post('/admin/treasury/swf/liquidate')
      .send({ targetPortfolioAumWld: '20000000' })
      .expect(201);
    expect(response.body).toEqual(mockReceipt);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(liquidateToTreasuryVault).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000001',
      '20000000',
    );
  });
});
