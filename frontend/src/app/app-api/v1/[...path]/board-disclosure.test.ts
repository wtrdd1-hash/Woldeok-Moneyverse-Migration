import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function request(query: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?${query}`, {
    headers: { host: 'easy-scraping.com' },
  });
}
const ctx = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };

function setup(payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  const upstream = vi.fn(async () => new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
  }));
  vi.stubGlobal('fetch', upstream);
  return upstream;
}

describe('Android public stock self-report filter', () => {
  it('returns 400 for duplicate or unsupported disclosure before fetching', async () => {
    const upstream = setup({ posts: [] });
    expect((await GET(request('positionDisclosure=holder&positionDisclosure=undisclosed'), ctx)).status).toBe(400);
    expect((await GET(request('positionDisclosure=verified_holder'), ctx)).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it('rejects an unverified upstream 200 instead of showing unfiltered posts', async () => {
    setup({ posts: [] });
    const response = await GET(request('positionDisclosure=holder'), ctx);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('accepts a verified empty result and applies noindex/no-store', async () => {
    const upstream = setup({ posts: [], appliedFilters: { positionDisclosure: 'holder' } });
    const response = await GET(request('positionDisclosure=holder'), ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('positionDisclosure')).toBe('holder');
  });
  it('rejects an upstream post that contradicts the requested self-report', async () => {
    setup({ posts: [{ postId: '123e4567-e89b-42d3-a456-426614174000', stock: { positionDisclosure: 'no_position' } }], appliedFilters: { positionDisclosure: 'holder' } });
    expect((await GET(request('positionDisclosure=holder'), ctx)).status).toBe(503);
  });
  it('rejects case-insensitive duplicate post UUIDs in a claimed filtered result', async () => {
    const id = '123e4567-e89b-42d3-a456-426614174000';
    setup({ posts: [
      { postId: id, stock: { positionDisclosure: 'holder' } },
      { postId: id.toUpperCase(), stock: { positionDisclosure: 'holder' } },
    ], appliedFilters: { positionDisclosure: 'holder' } });
    expect((await GET(request('positionDisclosure=holder'), ctx)).status).toBe(503);
  });

});
