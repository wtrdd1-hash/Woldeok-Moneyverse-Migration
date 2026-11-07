import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

function ownerRequest(method: 'GET' | 'HEAD', path = 'shop/holdings') {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/${path}`, {
    method,
    headers: { cookie: 'moneyverse_session=test-only-owner', host: 'easy-scraping.com' },
  });
}

function context(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

beforeEach(() => {
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('owner shop holdings App API privacy at the actual Next edge', () => {
  it.each([200, 401, 403, 503])('fences owner holdings GET %i even if upstream advertises public caching', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ holdings: [{ name: 'private item' }] }), {
      status,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400', 'etag': '"owner-etag"' },
    })));
    const response = await GET(ownerRequest('GET'), context('shop', 'holdings'));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it.each([401, 304])('fences owner holdings HEAD %i including conditional replies', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status,
      headers: { 'cache-control': 'public, max-age=86400', etag: '"owner-etag"' },
    })));
    const response = await HEAD(ownerRequest('HEAD'), context('shop', 'holdings'));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('fences future owner holdings subpaths without broadening public shop catalogue policy', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ items: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=120' },
    })));
    const owner = await GET(ownerRequest('GET', 'shop/holdings/search'), context('shop', 'holdings', 'search'));
    expect(owner.headers.get('cache-control')).toBe('private, no-store');
    expect(owner.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    const catalogue = await GET(ownerRequest('GET', 'shop/catalog'), context('shop', 'catalog'));
    expect(catalogue.headers.get('cache-control')).toBe('public, max-age=120');
    expect(catalogue.headers.get('x-robots-tag')).not.toBe('noindex, nofollow');
  });
});
