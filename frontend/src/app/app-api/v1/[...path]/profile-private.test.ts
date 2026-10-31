import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD, PUT } from './route';

const OWNER_COOKIE = 'moneyverse_session=profile-owner';
const OWNER_ID = 'c93199c9-4b7e-4c1e-a7c4-013d7ccafc7f';

function request(path: string, method = 'GET') {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/${path}`, {
    method,
    headers: {
      cookie: OWNER_COOKIE,
      ...(method === 'PUT' ? { 'x-csrf-token': 'owner-csrf', 'content-type': 'application/json' } : {}),
    },
    ...(method === 'PUT' ? { body: JSON.stringify({ displayName: 'Owner' }) } : {}),
  });
}

function context(path: string) {
  return { params: Promise.resolve({ path: path.split('/') }) };
}

function mockUpstream(status: number) {
  const spy = vi.fn(async () => new Response(status === 204 ? null : JSON.stringify({ profile: { displayName: 'Owner', email: 'owner@example.test' } }), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=86400',
      'x-robots-tag': 'index, follow',
      'referrer-policy': 'unsafe-url',
    },
  }));
  vi.stubGlobal('fetch', spy);
  return spy;
}

function expectPrivate(response: Response) {
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
}

beforeEach(() => { vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32)); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android member profile response privacy', () => {
  for (const [path, status] of [
    ['profile', 200],
    ['profile/settings', 200],
    [`profile/${OWNER_ID}`, 200],
    ['profile', 401],
    ['profile/settings', 503],
    ['profile', 204],
  ] as const) {
    it(`protects ${path} HTTP ${status} despite public upstream headers`, async () => {
      const spy = mockUpstream(status);
      const response = await GET(request(path), context(path));
      expect(response.status).toBe(status);
      expectPrivate(response);
      expect(spy).toHaveBeenCalledTimes(1);
      const [url, init] = spy.mock.calls[0] as unknown as [URL, RequestInit];
      expect(new URL(String(url)).pathname).toBe(`/api/v1/${path}`);
      expect(new Headers(init.headers).get('cookie')).toBe(OWNER_COOKIE);
    });
  }

  it('protects profile update responses while forwarding owner CSRF', async () => {
    const spy = mockUpstream(200);
    const response = await PUT(request('profile', 'PUT'), context('profile'));
    expectPrivate(response);
    const [, init] = spy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new Headers(init.headers).get('x-csrf-token')).toBe('owner-csrf');
    expect(new Headers(init.headers).get('cookie')).toBe(OWNER_COOKIE);
  });

  it('protects HEAD and returns no response body', async () => {
    const spy = vi.fn(async () => new Response(null, { status: 200, headers: { 'cache-control': 'public, max-age=86400' } }));
    vi.stubGlobal('fetch', spy);
    const response = await HEAD(request('profile/settings', 'HEAD'), context('profile/settings'));
    expect(response.status).toBe(200);
    expectPrivate(response);
    expect(await response.text()).toBe('');
  });

  it('protects gateway-generated early errors before contacting upstream', async () => {
    vi.stubEnv('APP_API_MIN_VERSION', '2.0.0');
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    const response = await GET(request('profile/settings'), context('profile/settings'));
    expect(response.status).toBe(426);
    expectPrivate(response);
    expect(spy).not.toHaveBeenCalled();
  });

  it('preserves public stock catalogue caching', async () => {
    mockUpstream(200);
    const response = await GET(request('stocks'), context('stocks'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=86400');
    expect(response.headers.get('referrer-policy')).not.toBe('no-referrer');
  });
});
