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

  it('does not schedule even when the runtime and scheduler flags are both enabled', async () => {
    vi.useFakeTimers();
    process.env.MONEYVERSE_SWF_SCHEDULER_ENABLED = 'true';
    const evaluateSpy = vi.spyOn(service, 'evaluateAndRebalance');
    service.onModuleInit();
    await vi.advanceTimersByTimeAsync(4 * 60 * 60 * 1000);
    expect(evaluateSpy).not.toHaveBeenCalled();
    expect(mockPool.query).not.toHaveBeenCalled();
    expect(mockPool.connect).not.toHaveBeenCalled();
  });

  it('fails closed when the SWF policy row is missing', async () => {
    mockPool.query = vi.fn().mockResolvedValue({ rows: [] });

    await expect(service.getConfig()).rejects.toMatchObject({
      status: 503,
      response: { code: 'SWF_CONFIG_UNAVAILABLE' },
    });
  });

  it('updates governance only through an actor-scoped audited database function', async () => {
    const verified = {
      id: 'current',
      is_enabled: true,
      safe_reserve_wld: '30000000',
      max_single_investment_wld: '5000000',
      reinvestment_ratio_pct: 10,
      max_investment_ratio_pct: 15,
      equity_ratio_pct: 60,
      bond_ratio_pct: 30,
      dividend_ratio_pct: 10,
      auto_harvest_enabled: false,
      auto_tax_enabled: false,
      auto_growth_yield_bps: 150,
      target_anchor_wld: '30000000',
      rebalance_interval_hours: 1,
      last_executed_at: null,
    };
    mockPool.query = vi.fn().mockResolvedValue({ rows: [{ config: verified }] });
    const updated = await service.updateConfig({
      is_enabled: true,
      reinvestment_ratio_pct: 10,
      max_investment_ratio_pct: 15,
      safe_reserve_wld: '30000000',
      max_single_investment_wld: '5000000',
    }, '11111111-1111-4111-8111-111111111111');
    expect(updated.safe_reserve_wld).toBe('30000000');
    expect(mockPool.query).toHaveBeenCalledTimes(1);
    const [sql, values] = mockPool.query.mock.calls[0]!;
    expect(sql).toContain('admin_swf_update_config');
    expect(sql).not.toContain('UPDATE public.treasury_swf_configs');
    expect(sql).not.toContain('INSERT INTO public.treasury_swf_events');
    expect(values[0]).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('rejects malformed investment governance before any database read or write', async () => {
    for (const bad of [
      { is_enabled: true, safe_reserve_wld: '1.5', max_single_investment_wld: '200', reinvestment_ratio_pct: 15, max_investment_ratio_pct: 20 },
      { is_enabled: true, safe_reserve_wld: '100', max_single_investment_wld: '200', reinvestment_ratio_pct: 100, max_investment_ratio_pct: 20 },
      { is_enabled: true, safe_reserve_wld: '100', max_single_investment_wld: '200', reinvestment_ratio_pct: 15, max_investment_ratio_pct: 31 },
    ]) {
      await expect(service.updateConfig(bad, '11111111-1111-4111-8111-111111111111'))
        .rejects.toMatchObject({ status: 400 });
    }
    expect(mockPool.query).not.toHaveBeenCalled();
  });
});
