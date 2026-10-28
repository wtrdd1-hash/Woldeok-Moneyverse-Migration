import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { SessionGuard } from '../../auth/guards/session.guard';
import { AuthenticatedGuard } from '../../auth/guards/authenticated.guard';
import { ConsentGuard } from '../../auth/guards/consent.guard';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import { AdminTreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';

const HOLD_CODE = 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE';

describe('P0 SWF manual liquidation financial boundary', () => {
  for (const enabled of ['true', 'false']) {
    it(`rejects manual liquidation without DB or Discord writes even when execution flag is ${enabled}`, async () => {
      const previous = process.env.MONEYVERSE_SWF_EXECUTION_ENABLED;
      process.env.MONEYVERSE_SWF_EXECUTION_ENABLED = enabled;
      try {
        const connect = vi.fn();
        const query = vi.fn();
        const sendDiscordEmbed = vi.fn();
        const sendAdminDirectMessage = vi.fn();
        const service = new AutoSovereignWealthFundService(
          { connect, query } as unknown as Pool,
          { sendDiscordEmbed, sendAdminDirectMessage } as unknown as DiscordAlertService,
        );
        await expect(service.liquidateToTreasuryVault('20000000')).rejects.toMatchObject({
          status: 503,
          response: { code: HOLD_CODE },
        });
        expect(connect).not.toHaveBeenCalled();
        expect(query).not.toHaveBeenCalled();
        expect(sendDiscordEmbed).not.toHaveBeenCalled();
        expect(sendAdminDirectMessage).not.toHaveBeenCalled();
      } finally {
        if (previous === undefined) delete process.env.MONEYVERSE_SWF_EXECUTION_ENABLED;
        else process.env.MONEYVERSE_SWF_EXECUTION_ENABLED = previous;
      }
    });
  }

  it('propagates HTTP 503 from the existing admin endpoint instead of reporting success', async () => {
    const connect = vi.fn();
    const swf = new AutoSovereignWealthFundService(
      { connect } as unknown as Pool,
      {} as DiscordAlertService,
    );
    const controller = new AdminTreasuryController({} as never, swf);
    await expect(controller.liquidateSwfToTreasury('1')).rejects.toMatchObject({
      status: 503,
      response: { code: HOLD_CODE },
    });
    expect(connect).not.toHaveBeenCalled();
  });

  it('does not retain the legacy unjournaled vault and portfolio mutation SQL in the liquidation method', () => {
    const source = readFileSync(fileURLToPath(new URL('./auto-swf.service.ts', import.meta.url)), 'utf8');
    const liquidation = source.slice(source.indexOf('  async liquidateToTreasuryVault('));
    expect(liquidation).not.toMatch(/UPDATE public\.(?:system_treasury_vaults|treasury_swf_portfolios)/);
    expect(liquidation).not.toMatch(/INSERT INTO public\.system_treasury_ledger/);
  });
});


describe('SWF manual liquidation HTTP contract', () => {
  let app: INestApplication;
  const connect = vi.fn();
  beforeAll(async () => {
    const swf = new AutoSovereignWealthFundService(
      { connect } as unknown as Pool,
      {} as DiscordAlertService,
    );
    const testingModule = await Test.createTestingModule({
      controllers: [AdminTreasuryController],
      providers: [
        { provide: TreasuryService, useValue: {} },
        { provide: AutoSovereignWealthFundService, useValue: swf },
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

  it('responds with 503 and a machine-readable hold code without opening a transaction', async () => {
    const response = await request(app.getHttpServer())
      .post('/admin/treasury/swf/liquidate')
      .send({ targetPortfolioAumWld: '20000000' })
      .expect(503);
    expect(response.body).toMatchObject({ code: HOLD_CODE });
    expect(connect).not.toHaveBeenCalled();
  });
});
