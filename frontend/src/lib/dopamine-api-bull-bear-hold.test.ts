// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { voteBullBear } from './dopamine-api';

describe('Bull/Bear vote API containment', () => {
  it('never sends an unreceipted vote or emits a wallet success event', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const walletSpy = vi.fn();
    window.addEventListener('moneyverse:wallet-updated', walletSpy);
    try {
      expect(await voteBullBear('bull', 'CHIPS')).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(walletSpy).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('moneyverse:wallet-updated', walletSpy);
      fetchSpy.mockRestore();
    }
  });
});
