import { afterEach, describe, expect, it, vi } from 'vitest';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';
import type { CentralBankService } from './central-bank.service';
import type { Queryable } from '../../core/db';

describe('automatic monetary policy scheduling safety', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
  it('does not set any timers when test or unattended automation is not explicitly authorized', () => {
    const timeout = vi.spyOn(globalThis, 'setTimeout');
    const interval = vi.spyOn(globalThis, 'setInterval');
    const service = new AutoMonetaryRegulationService({ query: vi.fn() } as Queryable, {} as CentralBankService);
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MONEYVERSE_MONETARY_AUTOREGULATION_ENABLED', 'true');
    service.onModuleInit();
    expect(timeout).not.toHaveBeenCalled();
    expect(interval).not.toHaveBeenCalled();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MONEYVERSE_MONETARY_AUTOREGULATION_ENABLED', 'false');
    service.onModuleInit();
    expect(timeout).not.toHaveBeenCalled();
    expect(interval).not.toHaveBeenCalled();
  });
  it('never invents faucet/sink data when database ledger reads fail', async () => {
    const pool = { query: vi.fn(async (sql: string) => {
      if (sql.includes('monetary_auto_regulation_configs')) return { rows: [{ is_enabled: true, target_faucet_sink_ratio: 1, tolerance_band_pct: 5, max_step_pct: 5, circuit_breaker_freeze_pct: 15 }] };
      if (sql.includes('FROM public.ledger_entries')) throw new Error('ledger source missing');
      return { rows: [] };
    }) } as unknown as Queryable;
    const centralBank = { proposePolicyOrder: vi.fn(), approvePolicyOrder: vi.fn(), freezeIssuance: vi.fn() };
    const service = new AutoMonetaryRegulationService(pool, centralBank as unknown as CentralBankService);
    await expect(service.evaluateAndExecute('00000000-0000-0000-0000-000000000000')).rejects.toThrow('ledger source missing');
    expect(centralBank.proposePolicyOrder).not.toHaveBeenCalled();
    expect(centralBank.approvePolicyOrder).not.toHaveBeenCalled();
  });
});
