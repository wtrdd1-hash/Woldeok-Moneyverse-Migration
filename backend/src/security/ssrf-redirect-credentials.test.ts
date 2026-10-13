import { afterEach, describe, expect, it, vi } from 'vitest';
import { safeFetch, SsrffSecurityError } from './ssrf-defense';

afterEach(() => vi.unstubAllGlobals());

describe('outbound redirect credential isolation', () => {
  it('rejects cross-origin redirects with bearer credentials before contacting the target', async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(null, {
      status: 302, headers: { location: 'https://1.1.1.1/steal' },
    }));
    vi.stubGlobal('fetch', request);
    await expect(safeFetch('https://8.8.8.8/entry', {
      headers: { Authorization: 'Bearer confidential' },
    })).rejects.toThrow(SsrffSecurityError);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('keeps credentials on same-origin redirects', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(new Response(null, {
        status: 307, headers: { location: '/next' },
      }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', request);
    await expect(safeFetch('https://8.8.8.8/start', {
      headers: { authorization: 'Bearer confidential' },
    })).resolves.toHaveProperty('status', 200);
    expect(request).toHaveBeenCalledTimes(2);
    expect(new Headers(request.mock.calls[1]?.[1]?.headers).get('authorization'))
      .toBe('Bearer confidential');
  });

  it('allows credential-free public GET redirects', async () => {
    const request = vi.fn()
      .mockResolvedValueOnce(new Response(null, {
        status: 302, headers: { location: 'https://1.1.1.1/public' },
      }))
      .mockResolvedValueOnce(new Response('ok', { status: 200 }));
    vi.stubGlobal('fetch', request);
    await expect(safeFetch('https://8.8.8.8/start')).resolves.toHaveProperty('status', 200);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('rejects cross-origin redirects that would replay request bodies', async () => {
    const request = vi.fn().mockResolvedValueOnce(new Response(null, {
      status: 307, headers: { location: 'https://1.1.1.1/collect' },
    }));
    vi.stubGlobal('fetch', request);
    await expect(safeFetch('https://8.8.8.8/start', {
      method: 'POST', body: JSON.stringify({ private: true }),
    })).rejects.toThrow(SsrffSecurityError);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('rejects URL-embedded credentials before any request', async () => {
    const request = vi.fn();
    vi.stubGlobal('fetch', request);
    await expect(safeFetch('https://user:pass@8.8.8.8/start'))
      .rejects.toThrow(SsrffSecurityError);
    expect(request).not.toHaveBeenCalled();
  });
});
