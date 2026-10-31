import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = { params: Promise.resolve({ path: ['shop', 'holdings'] }) };
const request = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/shop/holdings?${query}`, { headers: { cookie: 'moneyverse_session=owner' } });

describe('Android owner inventory expiry filter', () => {
  it('rejects duplicate and unknown expiry filters before forwarding', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    for (const query of ['filter=expiring_7d&filter=expiring_30d', 'filter=expiring_365d', 'filter=expiring_7d&foo=bar']) {
      const response = await GET(request(query), context);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it('keeps valid owner results private and rejects forged HTTP 200', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ filter: 'expiring_7d', holdings: [] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } }));
    vi.stubGlobal('fetch', upstream);
    const ok = await GET(request('filter=expiring_7d'), context);
    expect(ok.status).toBe(200);
    expect(ok.headers.get('cache-control')).toBe('private, no-store');
    expect(ok.headers.get('x-robots-tag')).toBe('noindex');
    expect(ok.headers.get('referrer-policy')).toBe('no-referrer');
    expect(new URL(String(upstream.mock.calls[0]![0])).searchParams.get('filter')).toBe('expiring_7d');
    upstream.mockImplementationOnce(async () => new Response(JSON.stringify({ filter: 'expiring_7d', holdings: [{ catalog_id: 'x', expires_at: null }] }), { headers: { 'content-type': 'application/json' } }));
    const bad = await GET(request('filter=expiring_7d'), context);
    expect(bad.status).toBe(503);
  });
});
