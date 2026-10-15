import { afterEach, describe, expect, it, vi } from 'vitest';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';
import type { Queryable } from '../../core/db';
import type { CentralBankService } from './central-bank.service';

const enabled = {
  id: 1, is_enabled: true, target_faucet_sink_ratio: 1,
  tolerance_band_pct: 5, max_step_pct: 5, circuit_breaker_freeze_pct: 15,
  last_evaluated_at: null, last_action_taken: 'NONE',
};

describe('emergency fail-closed monetary regulator v653', () => {
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });
  it('never schedules any money automation during Test', () => {
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('MONEYVERSE_MONETARY_AUTOREGULATION_ENABLED', 'true');
    const timeout = vi.spyOn(globalThis, 'setTimeout');
    const interval = vi.spyOn(globalThis, 'setInterval');
    const service = new AutoMonetaryRegulationService({ query: vi.fn() } as unknown as Queryable, {} as CentralBankService);
    service.onModuleInit();
    expect(timeout).not.toHaveBeenCalled();
    expect(interval).not.toHaveBeenCalled();
  });
  it('never schedules automation without explicit production opt-in', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('MONEYVERSE_MONETARY_AUTOREGULATION_ENABLED', 'false');
    const timeout = vi.spyOn(globalThis, 'setTimeout');
    const interval = vi.spyOn(globalThis, 'setInterval');
    new AutoMonetaryRegulationService({ query: vi.fn() } as unknown as Queryable, {} as CentralBankService).onModuleInit();
    expect(timeout).not.toHaveBeenCalled();
    expect(interval).not.toHaveBeenCalled();
  });
  it('throws on missing real ledger without writing policy order or fabricated event', async () => {
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('FROM public.monetary_auto_regulation_configs')) return { rows: [enabled] };
      if (sql.includes('FROM public.user_roles')) return { rows: [] };
      if (sql.includes('FROM public.ledger_entries')) throw new Error('relation ledger_entries does not exist');
      throw new Error('unexpected database query: ' + sql.slice(0,60));
    });
    const central = {
      proposePolicyOrder: vi.fn(), approvePolicyOrder: vi.fn(), freezeIssuance: vi.fn(),
    };
    const service = new AutoMonetaryRegulationService({ query } as unknown as Queryable, central as unknown as CentralBankService);
    await expect(service.evaluateAndExecute('11111111-1111-4111-8111-111111111111')).rejects.toThrow('ledger_entries');
    expect(central.proposePolicyOrder).not.toHaveBeenCalled();
    expect(central.approvePolicyOrder).not.toHaveBeenCalled();
    expect(query.mock.calls.some((args) => String(args[0]).includes('INSERT INTO public.monetary_regulation_events'))).toBe(false);
  });
  it('respects disabled DB switch before reading statistical ledger', async () => {
    const query = vi.fn(async (sql: string) => {
      if (sql.includes('FROM public.monetary_auto_regulation_configs')) return { rows: [{ ...enabled, is_enabled: false }] };
      throw new Error('disabled should not read monetary ledger');
    });
    const central = { proposePolicyOrder: vi.fn(), approvePolicyOrder: vi.fn() };
    const service = new AutoMonetaryRegulationService({ query } as unknown as Queryable, central as unknown as CentralBankService);
    expect(await service.evaluateAndExecute('11111111-1111-4111-8111-111111111111')).toBeNull();
    expect(query).toHaveBeenCalledTimes(1);
    expect(central.proposePolicyOrder).not.toHaveBeenCalled();
  });
});
