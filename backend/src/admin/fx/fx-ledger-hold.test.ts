import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { FxRepository } from './fx.repository';
import { FxService } from './fx.service';

const blockedCommands = [
  'WLD to USD swap',
  'USD to WLD swap',
  'forward margin reservation',
  'forward settlement',
] as const;

describe('P0 FX ledger integrity containment', () => {
  it.each(blockedCommands)('rejects %s at service boundary without invoking repository', async (command) => {
    const repo = {
      swapWldToUsd: vi.fn(),
      swapUsdToWld: vi.fn(),
      createForwardContract: vi.fn(),
      settleForwardContract: vi.fn(),
      getLatestRate: vi.fn(),
    };
    const service = new FxService(repo as unknown as FxRepository);
    const calls = {
      'WLD to USD swap': () => service.swapWldToUsd('member', 1000),
      'USD to WLD swap': () => service.swapUsdToWld('member', 1),
      'forward margin reservation': () => service.createForwardContract('member', 'BUY_USD', '1M', 100),
      'forward settlement': () => service.settleForwardContract('contract'),
    };

    await expect(calls[command]()).rejects.toBeInstanceOf(ServiceUnavailableException);
    for (const method of Object.values(repo)) expect(method).not.toHaveBeenCalled();
  });

  it.each(blockedCommands)('rejects %s at repository boundary before any database access', async (command) => {
    const pool = { query: vi.fn(), connect: vi.fn() };
    const repo = new FxRepository(pool as unknown as Pool);
    const calls = {
      'WLD to USD swap': () => repo.swapWldToUsd('member', 1000),
      'USD to WLD swap': () => repo.swapUsdToWld('member', 1),
      'forward margin reservation': () => repo.createForwardContract('member', 'BUY_USD', '1M', 100, 1300, 1300),
      'forward settlement': () => repo.settleForwardContract('contract', 1300),
    };

    await expect(calls[command]()).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(pool.query).not.toHaveBeenCalled();
    expect(pool.connect).not.toHaveBeenCalled();
  });
});
