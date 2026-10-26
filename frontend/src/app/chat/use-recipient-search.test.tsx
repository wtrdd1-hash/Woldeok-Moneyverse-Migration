import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parseRecipientSearch, useRecipientSearch } from './use-recipient-search';

const alice = { user_id: '00000000-0000-4000-8000-000000000001', display_name: 'Alice' };
const bob = { user_id: '00000000-0000-4000-8000-000000000002', display_name: 'Bob' };

function response(users: unknown, status = 200): Response {
  return new Response(JSON.stringify({ users }), { status, headers: { 'content-type': 'application/json' } });
}

async function tick() {
  await act(async () => { await vi.advanceTimersByTimeAsync(270); });
}

describe('authenticated chat recipient search', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it('accepts bounded, verified backend recipient rows', () => {
    expect(parseRecipientSearch({ users: [alice] }, 6)).toEqual([alice]);
    expect(parseRecipientSearch({ users: [] }, 6)).toEqual([]);
  });

  it('fails closed on malformed response shape or recipient identifiers', () => {
    expect(() => parseRecipientSearch({ users: 'not-an-array' }, 6)).toThrow();
    expect(() => parseRecipientSearch({ users: [{ user_id: '/chat?peer=bad', display_name: 'Fake' }] }, 6)).toThrow();
    expect(() => parseRecipientSearch({ users: [{ user_id: alice.user_id, display_name: null }] }, 6)).toThrow();
    expect(() => parseRecipientSearch({ users: [alice, bob] }, 1)).toThrow();
    expect(() => parseRecipientSearch({ users: [alice, alice] }, 6)).toThrow();
  });

  it('ignores a late response from an earlier search', async () => {
    let resolveOld!: (response: Response) => void;
    const fetcher = vi.fn().mockImplementationOnce(() => new Promise<Response>((resolve) => { resolveOld = resolve; }))
      .mockResolvedValueOnce(response([bob]));
    vi.stubGlobal('fetch', fetcher);
    const { result, rerender } = renderHook(({ query }) => useRecipientSearch(query, 6), { initialProps: { query: 'alice' } });
    await tick();
    rerender({ query: 'bob' });
    expect(result.current.users).toEqual([]);
    await tick();
    expect(result.current.users).toEqual([bob]);
    await act(async () => { resolveOld(response([alice])); await Promise.resolve(); });
    expect(result.current.users).toEqual([bob]);
    expect(fetcher.mock.calls[0]?.[1]?.signal.aborted).toBe(true);
  });

  it('does not retain stale recipients after HTTP errors or invalid JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response([alice]))
      .mockResolvedValueOnce(response([], 503))
      .mockResolvedValueOnce(new Response('broken json', { status: 200 })));
    const { result, rerender } = renderHook(({ query }) => useRecipientSearch(query, 6), { initialProps: { query: 'alice' } });
    await tick();
    expect(result.current.users).toEqual([alice]);
    rerender({ query: 'server error' });
    expect(result.current.users).toEqual([]);
    await tick();
    expect(result.current.error).toBe(true);
    expect(result.current.users).toEqual([]);
    rerender({ query: 'malformed' });
    await tick();
    expect(result.current.error).toBe(true);
    expect(result.current.users).toEqual([]);
  });

  it('does not query the backend for empty search input', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const { result } = renderHook(() => useRecipientSearch('  ', 8));
    await tick();
    expect(fetcher).not.toHaveBeenCalled();
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBe(false);
  });

  it('aborts pending backend requests when the search UI unmounts', async () => {
    const fetcher = vi.fn().mockImplementation(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetcher);
    const { unmount } = renderHook(() => useRecipientSearch('alice', 8));
    await tick();
    const signal = fetcher.mock.calls[0]?.[1]?.signal as AbortSignal;
    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

});
