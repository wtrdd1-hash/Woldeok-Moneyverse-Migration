import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { sampleHolding } from '@/testing/inventory-holding-fixture';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const path = { params: Promise.resolve({ path: ['shop', 'holdings'] }) };
function req() {
  return new NextRequest('https://easy-scraping.com/app-api/v1/shop/holdings', {
    headers: { cookie: 'moneyverse_session=owner' },
  });
}

describe('Android owner inventory source truth', () => {
  it('preserves verified owner holdings but overrides upstream public caching and referrer', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(
      async () =>
        new Response(JSON.stringify({ holdings: [sampleHolding] }), {
          headers: {
            'content-type': 'application/json',
            'cache-control': 'public, max-age=86400',
            'x-robots-tag': 'index',
          },
        }),
    );
    vi.stubGlobal('fetch', fetchSpy);
    const res = await GET(req(), path);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    expect(new Headers(fetchSpy.mock.calls[0]?.[1]?.headers).get('cookie')).toContain('owner');
  });
  it('rejects forged 200 empty-shape and invalid item fields instead of reporting zero', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    for (const payload of [
      { holdings: null },
      { holdings: [{ ...sampleHolding, weekly_cost: '1.2' }] },
    ]) {
      vi.stubGlobal(
        'fetch',
        vi.fn(
          async () =>
            new Response(JSON.stringify(payload), {
              headers: { 'content-type': 'application/json' },
            }),
        ),
      );
      const res = await GET(req(), path);
      expect(res.status).toBe(503);
      expect(res.headers.get('cache-control')).toBe('private, no-store');
      expect((await res.json()).code).toBe('inventory_unverified');
    }
  });
  it('keeps 401 errors private and does not reclassify a valid verified empty set', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('unauthorized', {
            status: 401,
            headers: { 'cache-control': 'public, max-age=100' },
          }),
      ),
    );
    const denied = await GET(req(), path);
    expect(denied.status).toBe(401);
    expect(denied.headers.get('cache-control')).toBe('private, no-store');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ holdings: [] }), {
            headers: { 'content-type': 'application/json' },
          }),
      ),
    );
    const empty = await GET(req(), path);
    expect(empty.status).toBe(200);
    expect((await empty.json()).holdings).toEqual([]);
  });
  it('protects nested owner holding actions from upstream public caching', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ success: true }), {
            headers: {
              'content-type': 'application/json',
              'cache-control': 'public, max-age=3600',
            },
          }),
      ),
    );
    const response = await GET(
      new NextRequest(
        'https://easy-scraping.com/app-api/v1/shop/holdings/00000000-0000-4000-8000-000000000001/consumptions',
      ),
      {
        params: Promise.resolve({
          path: ['shop', 'holdings', '00000000-0000-4000-8000-000000000001', 'consumptions'],
        }),
      },
    );
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
});
