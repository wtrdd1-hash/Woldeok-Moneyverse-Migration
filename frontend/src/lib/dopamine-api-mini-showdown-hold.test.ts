import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveMiniShowdown } from './dopamine-api';

describe('mini-showdown unledgered WLD settlement hold', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(['win', 'loss'] as const)(
    'never sends a %s settlement request or reports a WLD receipt',
    async (outcome) => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, payout: 190, outcome }),
      });
      vi.stubGlobal('fetch', fetchMock);
      const result = await resolveMiniShowdown(outcome, [6], [1], 100);
      expect(result).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );
});
