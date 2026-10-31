import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD, POST } from './route';

const context = (...path: string[]) => ({ params: Promise.resolve({ path }) });

function request(path: string, method = 'GET') {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/${path}`, {
    method,
    headers: {
      cookie: 'moneyverse_session=owner-session',
      'x-csrf-token': 'csrf-proof',
      'x-moneyverse-app-version': '1.2.3',
      'content-type': 'application/json',
    },
    ...(method === 'POST' ? { body: '{}' } : {}),
  });
}

function assertPrivate(response: Response) {
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android pension owner data privacy boundary', () => {
  for (const status of [200, 401, 503, 204]) {
    it(`overrides public upstream headers for pension overview HTTP ${status}`, async () => {
      vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
      const fetchSpy = vi.fn(async () => new Response(status === 204 ? null : JSON.stringify({ status }), {
        status,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=86400',
          'x-robots-tag': 'index, follow',
          'referrer-policy': 'unsafe-url',
        },
      }));
      vi.stubGlobal('fetch', fetchSpy);
      const response = await GET(request('pension/overview'), context('pension', 'overview'));
      expect(response.status).toBe(status);
      assertPrivate(response);
      const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
      expect(new URL(String(target)).pathname).toBe('/api/v1/pension/overview');
      expect(new Headers(init.headers).get('cookie')).toContain('owner-session');
    });
  }

  it('protects HEAD and empty bodies', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status: 204,
      headers: { 'cache-control': 'public, max-age=300', 'x-robots-tag': 'index, follow' },
    })));
    const response = await HEAD(request('pension/accounts', 'HEAD'), context('pension', 'accounts'));
    expect(response.status).toBe(204);
    assertPrivate(response);
  });

  it('protects pension mutation responses without changing CSRF forwarding', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ code: 'pension_hold' }), {
      status: 503,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await POST(request('pension/enroll', 'POST'), context('pension', 'enroll'));
    assertPrivate(response);
    expect(response.status).toBe(503);
    const [, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new Headers(init.headers).get('x-csrf-token')).toBe('csrf-proof');
  });

  it('protects early upgrade rejection before upstream fetch', async () => {
    vi.stubEnv('APP_API_MIN_VERSION', '2.0.0');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('pension/overview'), context('pension', 'overview'));
    expect(response.status).toBe(426);
    assertPrivate(response);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not privatize public stock catalogue', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ stocks: [] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
    })));
    const response = await GET(request('stocks'), context('stocks'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=300');
  });
});
