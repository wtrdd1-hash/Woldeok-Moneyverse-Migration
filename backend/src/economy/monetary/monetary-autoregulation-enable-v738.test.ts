import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { AutoMonetaryRegulationService } from './auto-monetary-regulation.service';

describe('v738 automatic monetary policy enablement is blocked without ledger settlement', () => {
  it('refuses to turn on automatic issuance before any SQL statement', async () => {
    const query = vi.fn();
    const service = new AutoMonetaryRegulationService({ query } as any, {} as any);
    await expect(service.updateConfig(true)).rejects.toThrow(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
  });

  it('cannot re-enable issuance using legacy flags', async () => {
    const previousExec = process.env.MONEYVERSE_MINT_EXECUTION_ENABLED;
    const previousLedger = process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED;
    process.env.MONEYVERSE_MINT_EXECUTION_ENABLED = 'true';
    process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED = 'true';
    try {
      const query = vi.fn();
      const service = new AutoMonetaryRegulationService({ query } as any, {} as any);
      await expect(service.updateConfig(true)).rejects.toThrow(ServiceUnavailableException);
      expect(query).not.toHaveBeenCalled();
    } finally {
      if (previousExec === undefined) delete process.env.MONEYVERSE_MINT_EXECUTION_ENABLED;
      else process.env.MONEYVERSE_MINT_EXECUTION_ENABLED = previousExec;
      if (previousLedger === undefined) delete process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED;
      else process.env.MONEYVERSE_MINT_LEDGER_CERTIFIED = previousLedger;
    }
  });

  it('allows administrators to disable an existing auto-regulation configuration', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ is_enabled: false, target_faucet_sink_ratio: '1', tolerance_band_pct: '5', max_step_pct: '1', circuit_breaker_freeze_pct: '5' }] });
    const service = new AutoMonetaryRegulationService({ query } as any, {} as any);
    const config = await service.updateConfig(false);
    expect(config.is_enabled).toBe(false);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]?.[1]?.[0]).toBe(false);
  });
});
