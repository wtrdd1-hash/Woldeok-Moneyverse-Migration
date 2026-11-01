// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { claimStarDrop } from './dopamine-api';

describe('Star Drop browser API financial boundary', () => {
  it('does not submit a locally selected tier or broadcast an unverified wallet credit', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const walletSpy = vi.fn();
    window.addEventListener('moneyverse:wallet-updated', walletSpy);
    try {
      expect(await claimStarDrop('legendary')).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(walletSpy).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('moneyverse:wallet-updated', walletSpy);
      fetchSpy.mockRestore();
    }
  });
});
