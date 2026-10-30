import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android owner-private shop receipt search', () => {
  it('forwards the owner cookie and bounded search while overriding cacheable backend headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));

    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ purchases: [{
      purchaseId: '00000000-0000-4000-8000-000000000001', amount: '9007199254740993', itemName: 'Blue Gloves', purchasedAt: '2026-10-30T00:00:00.000Z',
    }], summary: { count: 1, totalSpent: '9007199254740993', scope: 'displayed' } }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } }));


    const fetchSpy = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            purchases: [
              {
                purchaseId: 'owner-receipt',
                amount: '9007199254740993',
                itemName: 'Blue Gloves',
              },
            ],
          }),
          {
            headers: {
              'content-type': 'application/json',
              'cache-control': 'public, max-age=86400',
            },
          },
        ),
    );

    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/shop/purchases?q=Blue%20Gloves',
      {
        headers: { cookie: 'moneyverse_session=owner-session' },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['shop', 'purchases'] }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).searchParams.get('q')).toBe('Blue Gloves');
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner-session');
    expect((await response.json()).summary.totalSpent).toBe('9007199254740993');
  });
  it('fails closed when Android upstream returns a forged summary', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ purchases: [], summary: { count: 3, totalSpent: '999', scope: 'displayed' } }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/shop/purchases'), { params: Promise.resolve({ path: ['shop', 'purchases'] }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});

describe('Android owner-private KST shop receipt date filter', () => {
  it('forwards from/to and session with private headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ purchases: [] }), { headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/shop/purchases?from=2026-10-29&to=2026-10-30', { headers: { cookie: 'moneyverse_session=owner-session' } });
    const response = await GET(request, { params: Promise.resolve({ path: ['shop', 'purchases'] }) });
    expect(response.status).toBe(200);
    const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).searchParams.get('from')).toBe('2026-10-29');
    expect(new URL(String(target)).searchParams.get('to')).toBe('2026-10-30');
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner-session');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects duplicate or invalid minimum WLD before contacting upstream', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    for (const suffix of ['minAmount=1&minAmount=2', 'minAmount=0', 'minAmount=01']) {
      const request = new NextRequest(
        'https://easy-scraping.com/app-api/v1/shop/purchases?' + suffix,
      );
      const response = await GET(request, {
        params: Promise.resolve({ path: ['shop', 'purchases'] }),
      });
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('forwards minimum amount and fails closed if an upstream 200 violates the amount floor', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            purchases: [
              {
                purchaseId: 'receipt-1',
                amount: '40',
                itemName: 'Gloves',
              },
            ],
          }),
          { headers: { 'content-type': 'application/json' } },
        ),
    );
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/shop/purchases?minAmount=41',
      {
        headers: { cookie: 'moneyverse_session=owner-session' },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['shop', 'purchases'] }),
    });
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('minAmount')).toBe('41');
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
