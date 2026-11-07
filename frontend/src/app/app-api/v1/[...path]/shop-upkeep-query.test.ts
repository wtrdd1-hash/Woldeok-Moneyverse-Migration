import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['shop', 'catalog'] }) };

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function request(suffix: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/shop/catalog${suffix}`, {
    headers: { cookie: 'moneyverse_session=owner-session' },
  });
}

describe('Android shop upkeep ceiling contract', () => {
  it.each(['?maxUpkeep=0&maxUpkeep=1', '?maxUpkeep=-1', '?maxUpkeep=01', '?maxUpkeep=1.5', `?maxUpkeep=${'9'.repeat(31)}`])(
    'rejects malformed or duplicate ceiling %s without forwarding', async (suffix) => {
      vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
      const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
      const response = await GET(request(suffix), context);
      expect(response.status).toBe(400);
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

  it('forwards exact ceiling, verifies the returned upkeep, and keeps owner response private', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ catalogItems: [
      { code: 'free', maintenance_cost: '0', price: '9007199254740993' },
    ] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('?maxUpkeep=0'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).searchParams.get('maxUpkeep')).toBe('0');
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner-session');
  });

  it.each(['9007199254740993', '1.2', null])(
    'rejects upstream 200 with unverified or over-ceiling upkeep %j', async (maintenance_cost) => {
      vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
      vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ catalogItems: [
        { code: 'bad', maintenance_cost },
      ] }), { headers: { 'content-type': 'application/json' } })));
      const response = await GET(request('?maxUpkeep=0'), context);
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    },
  );
});


describe('Android public shop upkeep evidence', () => {
  it('rejects a non-JSON upstream success rather than accepting an unverifiable catalog', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not-json', {
      headers: { 'content-type': 'text/plain' },
    })));
    const response = await GET(request('?maxUpkeep=0'), context);
    expect(response.status).toBe(503);
  });

  it('allows a public catalog filter without a session, with no-store and noindex', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ catalogItems: [] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const response = await GET(
      new NextRequest('https://easy-scraping.com/app-api/v1/shop/public-catalog?maxUpkeep=0'),
      { params: Promise.resolve({ path: ['shop', 'public-catalog'] }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});
