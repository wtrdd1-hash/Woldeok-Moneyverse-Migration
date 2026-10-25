import { afterEach, describe, expect, it, vi } from 'vitest';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';

describe('SWF liquidation ledger boundary', () => {
  const previousExecution = process.env.MONEYVERSE_SWF_EXECUTION_ENABLED;

  afterEach(() => {
    if (previousExecution === undefined) {
      delete process.env.MONEYVERSE_SWF_EXECUTION_ENABLED;
    } else {
      process.env.MONEYVERSE_SWF_EXECUTION_ENABLED = previousExecution;
    }
  });

  it.each([
    { enabled: undefined, target: undefined },
    { enabled: 'true', target: '20000000' },
    { enabled: 'true', target: '0' },
    { enabled: 'false', target: '10000000' },
  ])('refuses unjournaled vault credits without side effects (%j)', async ({ enabled, target }) => {
    if (enabled === undefined) {
      delete process.env.MONEYVERSE_SWF_EXECUTION_ENABLED;
    } else {
      process.env.MONEYVERSE_SWF_EXECUTION_ENABLED = enabled;
    }

    const pool = { connect: vi.fn(), query: vi.fn() };
    const alerts = { sendAdminDirectMessage: vi.fn(), sendDiscordEmbed: vi.fn() };
    const service = new AutoSovereignWealthFundService(
      pool as unknown as Pool,
      alerts as unknown as DiscordAlertService,
    );

    await expect(service.liquidateToTreasuryVault(target)).rejects.toMatchObject({
      status: 503,
    });
    expect(pool.connect).not.toHaveBeenCalled();
    expect(pool.query).not.toHaveBeenCalled();
    expect(alerts.sendAdminDirectMessage).not.toHaveBeenCalled();
    expect(alerts.sendDiscordEmbed).not.toHaveBeenCalled();
  });
});
