import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const ctx = { params: Promise.resolve({ path: ['shop', 'catalog'] }) };
const call = (suffix: string) => GET(new NextRequest(`https://easy-scraping.com/app-api/v1/shop/catalog${suffix}`, {
  headers: { cookie: 'moneyverse_session=owner-session' },
}), ctx);

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android shop stock availability', () => {
  it('rejects duplicate/invalid selectors before contacting Nest', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    for (const suffix of ['?stock=available&stock=available', '?stock=sold_out', '?stock=']) {
      const response = await call(suffix);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('refuses stale HTTP 200 with sold-out or unverifiable quantities', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    for (const quantity of [0, -1, '0', undefined]) {
      vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ catalogItems: [{ catalog_id: '11111111-1111-4111-8111-111111111111', code: 'x', price: '9007199254740993', quantity }] }), { headers: { 'content-type': 'application/json' } })));
      const response = await call('?stock=available');
      expect(response.status).toBe(503);
    }
  });

  it('accepts only verified finite/unlimited stock and keeps the member response private', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ catalogItems: [
      { catalog_id: '11111111-1111-4111-8111-111111111111', code: 'limited', price: '9007199254740993', quantity: 2 }, { catalog_id: '22222222-2222-4222-8222-222222222222', code: 'unlimited', price: '0', quantity: null },
    ] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await call('?stock=available');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('stock')).toBe('available');
    expect((await response.json()).catalogItems).toHaveLength(2);
  });
});
