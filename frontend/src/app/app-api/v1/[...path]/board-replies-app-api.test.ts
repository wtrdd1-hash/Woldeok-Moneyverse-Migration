import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const base = 'https://easy-scraping.com/app-api/v1/board/public/stock-posts';
const headers = { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' };
const path = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
const post = { postId: '11111111-2222-4333-8444-555555555555', commentCount: 3 };
function stub(payload: unknown, contentType = 'application/json') {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const fetchSpy = vi.fn(async () => new Response(JSON.stringify(payload), { status: 200,
    headers: { 'content-type': contentType, 'cache-control': 'public, max-age=3600' } }));
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android public board replied-only source verification', () => {
  it('passes verified filtered results and prevents caching', async () => {
    const fetchSpy = stub({ posts: [post], appliedFilters: { repliedOnly: true, scope: 'latest50' } });
    const response = await GET(new NextRequest(`${base}?replied=1&stock=WDX`, { headers }), path);
    expect(response.status).toBe(200);
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('replied')).toBe('1');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it.each(['?replied=0', '?replied=1&replied=1', '?replied=true', '?replied=1&stock=A&stock=B'])(
    'rejects malformed query %s before calling backend', async (query) => {
      const fetchSpy = stub({ posts: [] });
      const response = await GET(new NextRequest(`${base}${query}`, { headers }), path);
      expect(response.status).toBe(400);
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );
  it.each([
    { posts: [] },
    { posts: [post] },
    { posts: [{ ...post, commentCount: 0 }], appliedFilters: { repliedOnly: true, scope: 'latest50' } },
  ])('rejects an unverified HTTP 200 response', async (payload) => {
    stub(payload);
    const response = await GET(new NextRequest(`${base}?replied=1`, { headers }), path);
    expect(response.status).toBe(503);
  });
  it('rejects non-JSON success payloads', async () => {
    stub({ posts: [post], appliedFilters: { repliedOnly: true, scope: 'latest50' } }, 'text/plain');
    const response = await GET(new NextRequest(`${base}?replied=1`, { headers }), path);
    expect(response.status).toBe(503);
  });
});
