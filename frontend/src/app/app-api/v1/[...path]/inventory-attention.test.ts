import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';
const path = { params: Promise.resolve({ path: ['shop', 'holdings'] }) };
const due = { catalog_id: '11111111-1111-4111-8111-111111111111', suspended: false, unpaid_weeks: 0, arrears_due: '9007199254740993' };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android owner holdings attention filter', () => {
  function setup(payload: unknown, status = 200) {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    return upstream;
  }
  it('accepts verified attention results and forces owner privacy headers', async () => {
    const upstream = setup({ filter: 'attention', holdings: [due] });
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings?filter=attention'), path);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('filter')).toBe('attention');
  });
  it.each([{ holdings: [] }, { filter: 'attention', holdings: [{ ...due, arrears_due: '0' }] }])('fails closed on unverifiable 200 %#', async (payload) => {
    setup(payload);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings?filter=attention'), path);
    expect(response.status).toBe(503);
  });
  it.each(['filter=attention&filter=attention', 'filter=other', 'filter=', 'filter=attention&owner=other'])('rejects malformed filters before upstream %#', async (query) => {
    const upstream = setup({ holdings: [] });
    const response = await GET(new NextRequest(`https://easy-scraping.com/app-api/v1/shop/holdings?${query}`), path);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it.each([204, 206, 304])('rejects bodyless or partial upstream status %s', async (status) => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(status === 206 ? JSON.stringify({ filter: 'attention', holdings: [due] }) : null,
      { status, headers: { 'content-type': 'application/json' } })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings?filter=attention'), path);
    expect(response.status).toBe(503);
  });
  it('does not claim HEAD has verified attention results', async () => {
    setup({ filter: 'attention', holdings: [] });
    const response = await HEAD(new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings?filter=attention', { method: 'HEAD' }), path);
    expect(response.status).toBe(503);
  });
});
