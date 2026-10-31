import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const base = 'https://easy-scraping.com/app-api/v1/shop/catalog';
const headers = { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' };
const context = { params: Promise.resolve({ path: ['shop', 'catalog'] }) };

function setup(rows: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ catalogItems: rows }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
  }));
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android shop sold-out search', () => {
  it('forwards a verified zero-stock list with private response headers', async () => {
    const spy = setup([{ catalog_id: 'a', quantity: 0, price: '9007199254740993' }]);
    const result = await GET(new NextRequest(`${base}?stock=sold_out`, { headers }), context);
    expect(result.status).toBe(200);
    expect(new URL(String(spy.mock.calls[0]?.[0])).searchParams.get('stock')).toBe('sold_out');
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
    expect(result.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it('rejects a stale backend that ignores sold-out selection', async () => {
    setup([{ catalog_id: 'a', quantity: 3, price: '9007199254740993' }]);
    const result = await GET(new NextRequest(`${base}?stock=sold_out`, { headers }), context);
    expect(result.status).toBe(503);
  });
  it('rejects duplicate stock values before proxying', async () => {
    const spy = setup([]);
    const result = await GET(new NextRequest(`${base}?stock=sold_out&stock=available`, { headers }), context);
    expect(result.status).toBe(400);
    expect(spy).not.toHaveBeenCalled();
  });
  it('rejects malformed inventory counts in an HTTP 200', async () => {
    setup([{ catalog_id: 'a', quantity: '0', price: '9007199254740993' }]);
    const result = await GET(new NextRequest(`${base}?stock=sold_out`, { headers }), context);
    expect(result.status).toBe(503);
  });
});
