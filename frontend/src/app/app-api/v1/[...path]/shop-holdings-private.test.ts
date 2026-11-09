import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('owner-private shop holdings app API', () => {
  it.each([200, 503])('overrides cacheable upstream headers for status %i', async (status) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ holdings: [] }), {
      status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings', {
      headers: { cookie: 'moneyverse_session=owner-session' },
    }), { params: Promise.resolve({ path: ['shop', 'holdings'] }) });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(new Headers((fetchSpy.mock.calls[0] as unknown as [URL, RequestInit])[1].headers).get('cookie')).toBe('moneyverse_session=owner-session');
  });
});
