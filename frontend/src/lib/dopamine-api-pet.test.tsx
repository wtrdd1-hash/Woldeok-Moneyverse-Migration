import { afterEach, describe, expect, it, vi } from 'vitest';
import { claimPetFortune } from './dopamine-api';

afterEach(() => { vi.unstubAllGlobals(); });

describe('informational pet fortune API', () => {
  it('does not broadcast a wallet balance update for a quote without a ledger receipt', async () => {
    const walletUpdated = vi.fn();
    window.addEventListener('moneyverse:wallet-updated', walletUpdated);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true, action: 'fortune', quote: '오늘의 점괘', rewardAmount: 0,
        rewardCredited: false, simulationOnly: true, affinityGained: 0,
        servedAt: '2026-10-24T00:00:00.000Z',
      }),
    }));
    try {
      const result = await claimPetFortune('fortune');
      expect(result?.rewardCredited).toBe(false);
      expect(walletUpdated).not.toHaveBeenCalled();
    } finally {
      window.removeEventListener('moneyverse:wallet-updated', walletUpdated);
    }
  });
});
