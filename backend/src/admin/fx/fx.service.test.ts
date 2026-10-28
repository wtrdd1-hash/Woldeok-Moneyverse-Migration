import { describe, expect, it, vi } from 'vitest';
import { FxService } from './fx.service';
import type { FxRepository } from './fx.repository';

describe('FX read-only observation', () => {
  it('passes through observed reserves without synthesizing a balance', async () => {
    const reserves = { id: 'reserve', totalReservesUsd: 1000, currentRate: 1350 };
    const repo = { getReserveStatus: vi.fn().mockResolvedValue(reserves) };
    const service = new FxService(repo as unknown as FxRepository);
    expect(await service.getReserveStatus()).toBe(reserves);
    expect(repo.getReserveStatus).toHaveBeenCalledOnce();
  });

  it('returns read-only theoretical forward rates without creating a contract', async () => {
    const repo = { getLatestRate: vi.fn().mockResolvedValue(1350) };
    const service = new FxService(repo as unknown as FxRepository);
    const rates = await service.getForwardRates();
    expect(rates.rates['1M'].forwardRate).toBeLessThan(1350);
    expect(rates.rates['6M'].forwardRate).toBeLessThan(rates.rates['1M'].forwardRate);
    expect(repo.getLatestRate).toHaveBeenCalledOnce();
  });
});
