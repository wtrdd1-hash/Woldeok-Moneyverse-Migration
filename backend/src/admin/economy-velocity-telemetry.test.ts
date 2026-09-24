import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import * as dbModule from '../core/db';
import { EconomyConsoleRepository } from './economy.repository';

describe('Economy Monetary Velocity Telemetry Engine', () => {
  const mockPool = {} as Queryable;
  const repository = new EconomyConsoleRepository(mockPool);

  it('computes 24h/7d/30d multi-window velocity, distribution and cohort purchasing power', async () => {
    const mockWindows = {
      faucet_24h: '5000',
      sink_24h: '2500',
      net_24h: '2500',
      faucet_7d: '20000',
      sink_7d: '15000',
      net_7d: '5000',
      faucet_30d: '100000',
      sink_30d: '80000',
      net_30d: '20000',
    };

    const mockDistribution = {
      active_circulating_wld: '100000',
      dormant_balances_wld: '20000',
      total_wld: '120000',
      p50: '5000',
      p90: '25000',
      p95: '40000',
      p99: '60000',
    };

    vi.spyOn(dbModule, 'queryOne')
      .mockResolvedValueOnce(mockWindows)
      .mockResolvedValueOnce(mockDistribution);

    const telemetry = await repository.monetaryVelocityTelemetry();

    expect(telemetry.policy_version).toBe('v2026.09.23.401');
    expect(typeof telemetry.observed_at).toBe('string');

    // Windows
    expect(telemetry.windows['24h'].gross_faucet_wld).toBe('5000');
    expect(telemetry.windows['24h'].hard_sink_wld).toBe('2500');
    expect(telemetry.windows['24h'].net_expansion_wld).toBe('2500');
    // velocity proxy = (5000 + 2500) / 100000 = 0.075
    expect(telemetry.windows['24h'].velocity_proxy).toBe(0.075);

    expect(telemetry.windows['7d'].gross_faucet_wld).toBe('20000');
    // velocity proxy = (20000 + 15000) / 100000 = 0.35
    expect(telemetry.windows['7d'].velocity_proxy).toBe(0.35);

    expect(telemetry.windows['30d'].gross_faucet_wld).toBe('100000');
    // velocity proxy = (100000 + 80000) / 100000 = 1.8
    expect(telemetry.windows['30d'].velocity_proxy).toBe(1.8);

    // Distribution
    expect(telemetry.supply_distribution.m2_total_wld).toBe('120000');
    expect(telemetry.supply_distribution.active_circulating_wld).toBe('100000');
    expect(telemetry.supply_distribution.dormant_balances_wld).toBe('20000');
    expect(telemetry.supply_distribution.percentiles.p50_wld).toBe('5000');
    expect(telemetry.supply_distribution.percentiles.p90_wld).toBe('25000');
    expect(telemetry.supply_distribution.percentiles.p95_wld).toBe('40000');
    expect(telemetry.supply_distribution.percentiles.p99_wld).toBe('60000');

    // Cohort Purchasing Power
    expect(telemetry.cohort_purchasing_power.new_user_core_basket_index).toBe(100.0);
    expect(telemetry.cohort_purchasing_power.middle_income_purchasing_index).toBe(100.0);
  });
});
