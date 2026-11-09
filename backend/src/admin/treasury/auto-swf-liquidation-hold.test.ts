import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import { AdminTreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';

describe('P0 SWF manual liquidation canonical financial boundary', () => {
  it('does not retain the legacy unjournaled vault and portfolio mutation SQL in the liquidation method', () => {
    const source = readFileSync(fileURLToPath(new URL('./auto-swf.service.ts', import.meta.url)), 'utf8');
    const liquidation = source.slice(source.indexOf('  async liquidateToTreasuryVault('));
    expect(liquidation).not.toMatch(/UPDATE public\.(?:system_treasury_vaults|treasury_swf_portfolios)/);
    expect(liquidation).not.toMatch(/INSERT INTO public\.system_treasury_ledger/);
  });

  it('rejects manual liquidation when database raises permission error 42501', async () => {
    const query = vi.fn().mockRejectedValue({ code: '42501' });
    const pool = { query } as unknown as Pool;
    const service = new AutoSovereignWealthFundService(pool, {} as DiscordAlertService);
    await expect(service.liquidateToTreasuryVault('00000000-0000-0000-0000-000000000001', '20000000')).rejects.toMatchObject({
      status: 403,
      response: { code: 'SWF_LIQUIDATION_NOT_AUTHORIZED' },
    });
  });

  it('holds unbacked valuation liquidation as HTTP 503 and never sends a success alert', async () => {
    const query = vi.fn().mockRejectedValue({ code: '55000' });
    const sendAdminDirectMessage = vi.fn();
    const pool = { query } as unknown as Pool;
    const service = new AutoSovereignWealthFundService(
      pool, { sendAdminDirectMessage } as unknown as DiscordAlertService,
    );
    await expect(service.liquidateToTreasuryVault('00000000-0000-0000-0000-000000000001', '20000000')).rejects.toMatchObject({
      status: 503,
      response: { code: 'SWF_UNFUNDED_LIQUIDATION_HELD' },
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('public.admin_swf_liquidate_to_vault'),
      ['00000000-0000-0000-0000-000000000001', '20000000'],
    );
    expect(sendAdminDirectMessage).not.toHaveBeenCalled();
  });

  it('invokes canonical admin_swf_liquidate_to_vault procedure and returns immutable ledger receipt', async () => {
    const mockReceipt = {
      success: true,
      code: 'SWF_LIQUIDATION_SETTLED',
      liquidated_wld: '181056162',
      prior_aum_wld: '201056162',
      new_aum_wld: '20000000',
      target_aum_wld: '20000000',
      vault_main_balance: '185055982',
      ledger_transaction_id: 'a0000000-0000-0000-0000-000000000001',
    };
    const query = vi.fn().mockResolvedValue({ rows: [{ receipt: mockReceipt }] });
    const sendAdminDirectMessage = vi.fn().mockResolvedValue(undefined);
    const pool = { query } as unknown as Pool;
    const service = new AutoSovereignWealthFundService(
      pool,
      { sendAdminDirectMessage } as unknown as DiscordAlertService,
    );
    const result = await service.liquidateToTreasuryVault('00000000-0000-0000-0000-000000000001', '20000000');
    expect(result).toEqual(mockReceipt);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('public.admin_swf_liquidate_to_vault'),
      ['00000000-0000-0000-0000-000000000001', '20000000'],
    );
    expect(sendAdminDirectMessage).toHaveBeenCalled();
  });
});

describe('SWF manual liquidation HTTP contract', () => {
  let app: INestApplication;
  const mockReceipt = {
    success: true,
    code: 'SWF_LIQUIDATION_SETTLED',
    liquidated_wld: '181056162',
    prior_aum_wld: '201056162',
    new_aum_wld: '20000000',
    target_aum_wld: '20000000',
    vault_main_balance: '185055982',
    ledger_transaction_id: 'a0000000-0000-0000-0000-000000000001',
  };
  const liquidateToTreasuryVault = vi.fn().mockResolvedValue(mockReceipt);

  beforeAll(async () => {
    const swf = { liquidateToTreasuryVault } as unknown as AutoSovereignWealthFundService;
    const testingModule = await Test.createTestingModule({
      controllers: [AdminTreasuryController],
      providers: [
        { provide: TreasuryService, useValue: {} },
        { provide: AutoSovereignWealthFundService, useValue: swf },
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

  it('responds with 200/201 and settled receipt from canonical liquidation procedure', async () => {
    const response = await request(app.getHttpServer())
      .post('/admin/treasury/swf/liquidate')
      .send({ targetPortfolioAumWld: '20000000' })
      .expect(201);
    expect(response.body).toEqual(mockReceipt);
    expect(liquidateToTreasuryVault).toHaveBeenCalledWith(
      '00000000-0000-0000-0000-000000000001',
      '20000000',
    );
  });
});
