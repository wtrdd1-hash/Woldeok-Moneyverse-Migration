import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const ctx = { params: Promise.resolve({ path: ['shop', 'catalog'] }) };
function request(suffix = '', headers: Record<string, string> = {}) {
  return new NextRequest('https://easy-scraping.com/app-api/v1/shop/catalog' + suffix, { headers });
}

describe('Android member catalogue budget', () => {
  it('forwards the exact budget and owner session, overriding public upstream cache policy', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ catalogItems: [{ price: '9007199254740993' }] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('?maxPrice=9007199254740993', { cookie: 'moneyverse_session=owner' }), ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).searchParams.get('maxPrice')).toBe('9007199254740993');
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner');
  });
  it.each(['?maxPrice=1&maxPrice=2', '?maxPrice=01', '?maxPrice=-1', '?maxPrice=9223372036854775808'])('rejects invalid budget %s without upstream access', async (suffix) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request(suffix), ctx);
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('fails closed when an upstream 200 ignores the budget', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ catalogItems: [{ price: '9007199254740994' }] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('?maxPrice=9007199254740993'), ctx);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('keeps owner catalogue errors private even when upstream says public', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 401, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=1000' } })));
    const response = await GET(request(), ctx);
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});
