import { describe, expect, it, vi } from 'vitest';
import { claimGoldenDuckFever } from './dopamine-api';

describe('Golden Duck legacy browser API finance hold', () => {
  it('never POSTs a claim or broadcasts wallet changes', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    try {
      expect(await claimGoldenDuckFever(200, 2)).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
