import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';

describe('AutoSovereignWealthFundService', () => {
  let service: AutoSovereignWealthFundService;
  let mockPool: any;
  let mockDiscordAlert: any;

  beforeEach(() => {
    process.env.MONEYVERSE_SWF_EXECUTION_ENABLED = 'true';
    delete process.env.MONEYVERSE_SWF_SCHEDULER_ENABLED;

    mockDiscordAlert = {
      sendAdminDirectMessage: vi.fn().mockResolvedValue({ success: true }),
      sendDiscordEmbed: vi.fn().mockResolvedValue(true),
    };

    mockPool = {
      query: vi.fn(),
      connect: vi.fn(),
    };

    service = new AutoSovereignWealthFundService(
      mockPool as unknown as Pool,
      mockDiscordAlert as unknown as DiscordAlertService,
    );
  });

  afterEach(() => {
    service.onModuleDestroy();
    vi.useRealTimers();
    delete process.env.MONEYVERSE_SWF_EXECUTION_ENABLED;
    delete process.env.MONEYVERSE_SWF_SCHEDULER_ENABLED;
  });

  it('fails closed when runtime execution is not explicitly enabled', async () => {
    delete process.env.MONEYVERSE_SWF_EXECUTION_ENABLED;

    const result = await service.evaluateAndRebalance();

    expect(result).toEqual({
      executed: false,
      reason: 'SWF_RUNTIME_EXECUTION_DISABLED',
    });
    expect(mockPool.connect).not.toHaveBeenCalled();
  });

  it('never synthesizes SWF revenue or changes balances even with runtime execution explicitly enabled', async () => {
    mockPool.query = vi.fn().mockRejectedValue(new Error('DB must not be accessed'));
    mockPool.connect = vi.fn().mockRejectedValue(new Error('DB must not be accessed'));

    const result = await service.evaluateAndRebalance();

    expect(result).toEqual({
      executed: false,
      reason: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE',
    });
    expect(mockPool.query).not.toHaveBeenCalled();
    expect(mockPool.connect).not.toHaveBeenCalled();
    expect(mockDiscordAlert.sendAdminDirectMessage).not.toHaveBeenCalled();
    expect(mockDiscordAlert.sendDiscordEmbed).not.toHaveBeenCalled();
  });

  it('scheduled SWF cycle also cannot touch DB or send synthetic settlement notices', async () => {
    vi.useFakeTimers();
    process.env.MONEYVERSE_SWF_SCHEDULER_ENABLED = 'true';
    mockPool.query = vi.fn().mockRejectedValue(new Error('DB must not be accessed'));
    mockPool.connect = vi.fn().mockRejectedValue(new Error('DB must not be accessed'));

    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);

    expect(mockPool.query).not.toHaveBeenCalled();
    expect(mockPool.connect).not.toHaveBeenCalled();
    expect(mockDiscordAlert.sendAdminDirectMessage).not.toHaveBeenCalled();
    expect(mockDiscordAlert.sendDiscordEmbed).not.toHaveBeenCalled();
  });

  it('never executes a SWF cycle merely because the backend restarted', async () => {
    vi.useFakeTimers();
    process.env.MONEYVERSE_SWF_SCHEDULER_ENABLED = 'true';
    const evaluateSpy = vi.spyOn(service, 'evaluateAndRebalance').mockResolvedValue({
      executed: false,
      reason: 'TEST',
    });

    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(30_000);
    expect(evaluateSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(60 * 60 * 1000 - 30_000);
    expect(evaluateSpy).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the SWF policy row is missing', async () => {
    mockPool.query = vi.fn().mockResolvedValue({ rows: [] });

    const config = await service.getConfig();

    expect(config.is_enabled).toBe(false);
  });

  it('updates governance configuration correctly', async () => {
    mockPool.query = vi.fn().mockResolvedValue({ rows: [] });
    const getConfigSpy = vi.spyOn(service, 'getConfig').mockResolvedValue({
      id: 'current',
      is_enabled: true,
      safe_reserve_wld: '30000000',
      max_single_investment_wld: '5000000',
      reinvestment_ratio_pct: 10,
      max_investment_ratio_pct: 15,
      equity_ratio_pct: 60,
      bond_ratio_pct: 30,
      dividend_ratio_pct: 10,
      auto_harvest_enabled: true,
      auto_tax_enabled: true,
      auto_growth_yield_bps: 150,
      target_anchor_wld: '30000000',
      rebalance_interval_hours: 1,
      last_executed_at: null,
    });

    const updated = await service.updateConfig({
      reinvestment_ratio_pct: 10,
      max_investment_ratio_pct: 15,
      safe_reserve_wld: '30000000',
    });

    expect(updated.reinvestment_ratio_pct).toBe(10);
    expect(updated.max_investment_ratio_pct).toBe(15);
    expect(updated.safe_reserve_wld).toBe('30000000');
    expect(mockPool.query).toHaveBeenCalled();
    getConfigSpy.mockRestore();
  });
});
