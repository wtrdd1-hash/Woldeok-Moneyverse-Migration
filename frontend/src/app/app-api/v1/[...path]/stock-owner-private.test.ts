import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

function context(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

function request(path: string, method = 'GET') {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/${path}`, {
    method,
    headers: { cookie: 'moneyverse_session=owner-session' },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('owner-private stock app-api cache boundary', () => {
  it.each(['portfolio', 'history'])('overrides cacheable %s success and robots policy', async (path) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ holdings: [], trades: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400', 'x-robots-tag': 'index, follow' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request(`stocks/${path}`), context('stocks', path));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    const [, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner-session');
  });

  it.each([401, 503])('does not cache owner portfolio error %s', async (status) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status }), {
      status,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request('stocks/portfolio'), context('stocks', 'portfolio'));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('protects owner stock history HEAD 204 without creating a body', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status: 204, headers: { 'cache-control': 'public, max-age=3600' },
    })));
    const response = await HEAD(request('stocks/history', 'HEAD'), context('stocks', 'history'));
    expect(response.status).toBe(204);
    expect(await response.text()).toBe('');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });

  it('does not alter the public stock market cache policy', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ stocks: [] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' },
    })));
    const response = await GET(request('stocks'), context('stocks'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=60');
  });
});
