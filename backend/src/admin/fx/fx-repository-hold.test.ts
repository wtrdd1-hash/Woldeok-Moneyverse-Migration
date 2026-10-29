import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { FxRepository } from './fx.repository';

describe('FX repository direct-write containment', () => {
  const operations = [
    ['getOrCreateUserWallet', (repo: FxRepository) => repo.getOrCreateUserWallet('member')],
    ['setHalt', (repo: FxRepository) => repo.setHalt(true)],
    ['swapWldToUsd', (repo: FxRepository) => repo.swapWldToUsd('member', 1000)],
    ['swapUsdToWld', (repo: FxRepository) => repo.swapUsdToWld('member', 1)],
    ['executeSmoothingIntervention', (repo: FxRepository) => repo.executeSmoothingIntervention('SELL_USD', 100, 'admin')],
    ['drawdownCurrencySwap', (repo: FxRepository) => repo.drawdownCurrencySwap('agreement', 100, 'admin', 'test')],
    ['createForwardContract', (repo: FxRepository) => repo.createForwardContract('member', 'BUY_USD', '1M', 100, 1350, 1350)],
    ['settleForwardContract', (repo: FxRepository) => repo.settleForwardContract('contract', 1350)],
  ] as const;
  for (const [name, invoke] of operations) {
    it(`${name} rejects before acquiring a database connection`, async () => {
      const query = vi.fn();
      const connect = vi.fn();
      const repo = new FxRepository({ query, connect } as never);
      await expect(invoke(repo)).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(query).not.toHaveBeenCalled();
      expect(connect).not.toHaveBeenCalled();
    });
  }
});
