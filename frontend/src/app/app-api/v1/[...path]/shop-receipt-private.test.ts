import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android owner-private shop receipt search', () => {
  it('forwards the owner cookie and bounded search while overriding cacheable backend headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ purchases: [{
      purchaseId: 'owner-receipt', amount: '9007199254740993', itemName: 'Blue Gloves',
    }] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/shop/purchases?q=Blue%20Gloves', {
      headers: { cookie: 'moneyverse_session=owner-session' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['shop', 'purchases'] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).searchParams.get('q')).toBe('Blue Gloves');
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner-session');
    expect((await response.json()).purchases[0].amount).toBe('9007199254740993');
  });
});
