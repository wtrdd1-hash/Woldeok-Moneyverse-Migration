import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android member photo submissions privacy and source proof', () => {
  it('forwards the session but never forwards public caching or referrer policy', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ submissions: [] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/photos/mine', {
      headers: { cookie: 'moneyverse_session=member-session' },
    }), { params: Promise.resolve({ path: ['photos', 'mine'] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(new Headers(upstream.mock.calls[0]?.[1]?.headers).get('cookie')).toContain('member-session');
  });
  it('never mutates immutable native fetch response headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = new Response(JSON.stringify({ submissions: [] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    });
    Object.defineProperty(upstream, 'headers', {
      value: new Proxy(upstream.headers, {
        get(target, key) {
          if (key === 'set') return () => { throw new TypeError('immutable'); };
          const value = Reflect.get(target, key, target) as unknown;
          return typeof value === 'function' ? value.bind(target) : value;
        },
      }),
    });
    vi.stubGlobal('fetch', vi.fn(async () => upstream));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/photos/mine'), {
      params: Promise.resolve({ path: ['photos', 'mine'] }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('fails closed when an old backend returns a fabricated owner submission list', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ submissions: 'invalid' }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/photos/mine'), {
      params: Promise.resolve({ path: ['photos', 'mine'] }),
    });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('protects HEAD and upstream failures as owner-private responses', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status: 503, headers: { 'cache-control': 'public, max-age=86400' },
    })));
    const response = await HEAD(new NextRequest('https://easy-scraping.com/app-api/v1/photos/mine', {
      method: 'HEAD',
    }), { params: Promise.resolve({ path: ['photos', 'mine'] }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
});
