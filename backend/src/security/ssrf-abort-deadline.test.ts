import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeFetch } from './ssrf-defense';

function waitingFetch() {
  return vi.fn((_url: string | URL | Request, options?: RequestInit) =>
    new Promise<Response>((_resolve, reject) => {
      options?.signal?.addEventListener('abort', () => {
        reject(new DOMException('The operation was aborted', 'AbortError'));
      }, { once: true });
    }),
  );
}

describe('safeFetch abort deadline', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('enforces the 10-second deadline even when a caller supplies a signal', async () => {
    vi.useFakeTimers();
    const mock = waitingFetch();
    vi.stubGlobal('fetch', mock);
    const caller = new AbortController();
    const request = safeFetch('https://1.1.1.1/slow', { signal: caller.signal });
    const rejection = expect(request).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(10_001);
    await rejection;
    expect(mock).toHaveBeenCalledTimes(1);
    expect(caller.signal.aborted).toBe(false);
  });

  it('still honors an earlier caller cancellation', async () => {
    const mock = waitingFetch();
    vi.stubGlobal('fetch', mock);
    const caller = new AbortController();
    const request = safeFetch('https://1.1.1.1/cancel', { signal: caller.signal });
    await Promise.resolve();
    caller.abort();
    await expect(request).rejects.toMatchObject({ name: 'AbortError' });
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it('does not restart the timeout when following a same-origin redirect', async () => {
    vi.useFakeTimers();
    const pending = waitingFetch();
    const mock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: '/slow' } }))
      .mockImplementation(pending);
    vi.stubGlobal('fetch', mock);
    const caller = new AbortController();
    const request = safeFetch('https://1.1.1.1/start', { signal: caller.signal });
    const rejection = expect(request).rejects.toMatchObject({ name: 'AbortError' });
    await vi.advanceTimersByTimeAsync(10_001);
    await rejection;
    expect(mock).toHaveBeenCalledTimes(2);
  });
});
