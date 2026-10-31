import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD, POST } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function ownerRequest(method = 'GET') {
  return new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings', {
    method,
    headers: { cookie: 'moneyverse_session=owner-session' },
  });
}

const context = { params: Promise.resolve({ path: ['shop', 'holdings'] }) };

describe('Android owner inventory holdings privacy boundary', () => {
  it('overrides an upstream public cache policy on owner holdings success without changing payload or session', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = { holdings: [{ catalog_id: 'private-item', quantity: 1 }] };
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify(upstream), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(ownerRequest(), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject(upstream);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    const [, options] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new Headers(options.headers).get('cookie')).toBe('moneyverse_session=owner-session');
  });

  it('keeps private headers when an upstream holdings error is cacheable', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ code: 'temporarily_unavailable' }), {
      status: 503,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
    })));
    const response = await GET(ownerRequest(), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('keeps owner holdings HEAD responses private, including empty 204 responses', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status: 204, headers: { 'cache-control': 'public, max-age=3600' },
    })));
    const response = await HEAD(ownerRequest('HEAD'), context);
    expect(response.status).toBe(204);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it('protects nested holdings mutations without changing their HTTP status', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ equipped: true }), {
      status: 201, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings/item-1/equip', {
      method: 'POST', headers: { cookie: 'moneyverse_session=owner-session', 'x-csrf-token': 'csrf', 'content-type': 'application/json' },
      body: JSON.stringify({ slot: 'head' }),
    });
    const response = await POST(request, { params: Promise.resolve({ path: ['shop', 'holdings', 'item-1', 'equip'] }) });
    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

});
