import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import { AdminTreasuryController } from './treasury.controller';

describe('P0 autonomous SWF ledger containment', () => {
  afterEach(() => {
    vi.useRealTimers();
    delete process.env.MONEYVERSE_SWF_EXECUTION_ENABLED;
    delete process.env.MONEYVERSE_SWF_SCHEDULER_ENABLED;
  });

  it('refuses explicit execution before any DB or Discord side effect', async () => {
    process.env.MONEYVERSE_SWF_EXECUTION_ENABLED = 'true';
    const pool = { query: vi.fn(), connect: vi.fn() };
    const alerts = { sendAdminDirectMessage: vi.fn(), sendDiscordEmbed: vi.fn() };
    const service = new AutoSovereignWealthFundService(
      pool as unknown as Pool,
      alerts as unknown as DiscordAlertService,
    );
    expect(await service.evaluateAndRebalance()).toEqual({
      executed: false,
      reason: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE',
    });
    expect(pool.query).not.toHaveBeenCalled();
    expect(pool.connect).not.toHaveBeenCalled();
    expect(alerts.sendAdminDirectMessage).not.toHaveBeenCalled();
    expect(alerts.sendDiscordEmbed).not.toHaveBeenCalled();
  });

  it('never arms a scheduler even with both runtime switches enabled', async () => {
    vi.useFakeTimers();
    process.env.MONEYVERSE_SWF_EXECUTION_ENABLED = 'true';
    process.env.MONEYVERSE_SWF_SCHEDULER_ENABLED = 'true';
    const pool = { query: vi.fn(), connect: vi.fn() };
    const service = new AutoSovereignWealthFundService(
      pool as unknown as Pool,
      { sendAdminDirectMessage: vi.fn(), sendDiscordEmbed: vi.fn() } as unknown as DiscordAlertService,
    );
    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(4 * 60 * 60 * 1000);
    expect(pool.query).not.toHaveBeenCalled();
    expect(pool.connect).not.toHaveBeenCalled();
    service.onModuleDestroy();
  });

  it('admin mutation endpoint returns 503 without dispatching SWF work', async () => {
    const swf = { evaluateAndRebalance: vi.fn() };
    const controller = new AdminTreasuryController({} as never, swf as never);
    await expect(controller.triggerSwfRebalance()).rejects.toMatchObject({ status: 503 });
    expect(swf.evaluateAndRebalance).not.toHaveBeenCalled();
  });
});
