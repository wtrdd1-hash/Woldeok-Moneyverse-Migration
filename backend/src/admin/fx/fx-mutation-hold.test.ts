import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { FxService } from './fx.service';
import type { FxRepository } from './fx.repository';

/** The FX implementation is not ledger-backed: no mutation may reach a repository or notify Discord. */
describe('FX financial mutation containment', () => {
  const methods = [
    ['setHalt', (s: FxService) => s.setHalt(false, 'admin')],
    ['swapWldToUsd', (s: FxService) => s.swapWldToUsd('member', 100000)],
    ['swapUsdToWld', (s: FxService) => s.swapUsdToWld('member', 100)],
    ['executeSmoothingIntervention', (s: FxService) => s.executeSmoothingIntervention('SELL_USD', 50000, 'admin')],
    ['drawdownCurrencySwap', (s: FxService) => s.drawdownCurrencySwap('agreement', 500, 'admin')],
    ['createForwardContract', (s: FxService) => s.createForwardContract('member', 'BUY_USD', '1M', 100)],
    ['settleForwardContract', (s: FxService) => s.settleForwardContract('contract')],
    ['getUserWallet', (s: FxService) => s.getUserWallet('member')],
  ] as const;

  for (const [name, invoke] of methods) {
    it(`${name} rejects before any database or external side effect`, async () => {
      const repoCall = vi.fn().mockRejectedValue(new Error('unsafe repository reached'));
      const repo = new Proxy({}, { get: () => repoCall }) as FxRepository;
      const notify = vi.fn();
      const service = new FxService(repo, { sendAdminDirectMessage: notify } as never);
      await expect(invoke(service)).rejects.toBeInstanceOf(ServiceUnavailableException);
      expect(repoCall).not.toHaveBeenCalled();
      expect(notify).not.toHaveBeenCalled();
    });
  }
});
