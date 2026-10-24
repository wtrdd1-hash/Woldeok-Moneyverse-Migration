// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchPetFortunePreview } from './dopamine-api';

afterEach(() => vi.unstubAllGlobals());

describe('fortune preview transport', () => {
  it('accepts only a verified nonfinancial preview without emitting a wallet event', async () => {
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({
      kind: 'preview', quote: 'A balanced plan matters more than a lucky prediction.', rewardPosted: false,
    }), { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const dispatch = vi.spyOn(window, 'dispatchEvent');
    try {
      expect(await fetchPetFortunePreview()).toEqual({
        kind: 'preview', quote: 'A balanced plan matters more than a lucky prediction.', rewardPosted: false,
      });
      expect(fetchSpy.mock.calls[0]).toBeDefined();
      expect(dispatch).not.toHaveBeenCalled();
    } finally {
      dispatch.mockRestore();
    }
  });

  it('rejects a fabricated reward payload and an unavailable server', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      kind: 'preview', quote: 'Lucky!', rewardPosted: true, rewardAmount: 1000,
    }), { status: 200 })));
    expect(await fetchPetFortunePreview()).toBeNull();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('unavailable', { status: 503 })));
    expect(await fetchPetFortunePreview()).toBeNull();
  });
});
