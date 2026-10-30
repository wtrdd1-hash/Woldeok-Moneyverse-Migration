import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const receipt = {
  purchaseId: '00000000-0000-4000-8000-000000000002',
  itemId: '00000000-0000-4000-8000-000000000003',
  itemName: '상품',
  transactionId: '00000000-0000-4000-8000-000000000004',
  amount: '9007199254740993',
  purchasedAt: '2026-10-30T03:00:00.000Z',
};

describe('Android private shop purchase export JSON', () => {
  it('keeps owner cookie, amount precision, and private headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(
      async () =>
        new Response(JSON.stringify({ scope: 'recent100', purchases: [receipt] }), {
          headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
        }),
    );
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/shop/purchases/export?q=%EC%83%81%ED%92%88',
      {
        headers: { cookie: 'moneyverse_session=owner-session' },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['shop', 'purchases', 'export'] }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).purchases[0].amount).toBe('9007199254740993');
    const [target, init] = upstream.mock.calls[0] as unknown as [URL, RequestInit];
    expect(String(target)).toContain('/api/v1/shop/purchases/export?q=');
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner-session');
  });
  it('refuses malformed successful upstream JSON instead of claiming an empty export', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ scope: 'recent100', purchases: [{ amount: 1 }] }), {
            headers: { 'content-type': 'application/json' },
          }),
      ),
    );
    const response = await GET(
      new NextRequest('https://easy-scraping.com/app-api/v1/shop/purchases/export'),
      {
        params: Promise.resolve({ path: ['shop', 'purchases', 'export'] }),
      },
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
