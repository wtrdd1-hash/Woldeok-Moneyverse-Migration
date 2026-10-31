import { ServiceUnavailableException } from '@nestjs/common';
import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { FxRepository } from './fx.repository';
import { FxService } from './fx.service';

const repositoryWithRows = (rows: unknown[]) => {
  const query = vi.fn().mockResolvedValue({ rows });
  const repository = new FxRepository({ query } as unknown as Pool);
  return { repository, query };
};

describe('FX source evidence is mandatory', () => {
  it('rejects a missing reserve row instead of inventing the 1350 spot rate', async () => {
    const { repository } = repositoryWithRows([]);
    await expect(repository.getLatestRate()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it.each([null, undefined, 0, -1, Number.NaN, Number.POSITIVE_INFINITY, '1350', 'not-a-rate'])(
    'rejects an unverified spot rate %s', async (rate) => {
      const { repository } = repositoryWithRows([{ rate }]);
      await expect(repository.getLatestRate()).rejects.toBeInstanceOf(ServiceUnavailableException);
    },
  );

  it('returns the observed positive finite rate without fallback', async () => {
    const { repository, query } = repositoryWithRows([{ rate: 1352.5 }]);
    await expect(repository.getLatestRate()).resolves.toBe(1352.5);
    expect(query).toHaveBeenCalledOnce();
  });

  it('does not calculate public forward rates when the authoritative spot rate is absent', async () => {
    const { repository } = repositoryWithRows([]);
    const service = new FxService(repository);
    await expect(service.getForwardRates()).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(service.getEarlyWarningStatus()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('rejects a missing reserve master row with 503, not a generic 500', async () => {
    const { repository } = repositoryWithRows([]);
    await expect(repository.getReserveStatus()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
