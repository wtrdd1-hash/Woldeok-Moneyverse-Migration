import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

const origin = 'https://easy-scraping.com';

function request(path: string, method = 'GET'): NextRequest {
  return new NextRequest(`${origin}/app-api/v1/${path}`, {
    method,
    headers: { cookie: 'moneyverse_session=owner', host: 'easy-scraping.com' },
  });
}

function context(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

function expectPrivate(response: Response) {
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
}

beforeEach(() => {
  vi.stubEnv('APP_BASE_URL', origin);
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubEnv('APP_API_ANDROID_ONLY', 'false');
  vi.stubEnv('APP_API_MIN_VERSION', '');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android authentication gateway privacy', () => {
  it('does not cache mobile OAuth authorization URLs generated at the edge', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('auth/google/authorize?client=mobile'), context('auth', 'google', 'authorize'));
    expect(response.status).toBe(200);
    expectPrivate(response);
    expect(await response.json()).toEqual({
      authorizationUrl: `${origin}/auth/google/authorize?client=mobile`,
    });
    expect(upstream).not.toHaveBeenCalled();
  });

  it.each([200, 401, 503])('never inherits public cache headers on owner auth viewer HTTP %s', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ signedIn: status === 200 }), {
      status,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request('auth/viewer'), context('auth', 'viewer'));
    expect(response.status).toBe(status);
    expectPrivate(response);
  });

  it('keeps OAuth callback redirect and cookies but never caches the callback', async () => {
    const upstream = vi.fn(async () => new Response(null, {
      status: 302,
      headers: {
        location: '/auth/complete',
        'set-cookie': 'moneyverse_session=rotated; HttpOnly; Secure; Path=/',
        'cache-control': 'public, max-age=3600',
      },
    }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('auth/google/callback?code=private'), context('auth', 'google', 'callback'));
    expect(response.status).toBe(302);
    expectPrivate(response);
    expect(response.headers.get('location')).toBe('/auth/complete');
    expect(response.headers.get('set-cookie')).toContain('moneyverse_session=rotated');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).pathname).toBe('/auth/google/callback');
  });

  it('protects HEAD responses without adding a response body', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status: 204,
      headers: { 'cache-control': 'public, max-age=3600' },
    })));
    const response = await HEAD(request('auth/viewer', 'HEAD'), context('auth', 'viewer'));
    expect(response.status).toBe(204);
    expectPrivate(response);
    expect(await response.text()).toBe('');
  });

  it('does not change public app contract metadata caching', async () => {
    const response = await GET(request('meta/contract'), context('meta', 'contract'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=300');
  });
});
