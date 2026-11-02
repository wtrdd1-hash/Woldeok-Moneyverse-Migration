import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const path = ['board', 'public', 'stock-posts'];
function request(media: string, method = 'GET') {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?media=${media}`, {
    method, headers: { host: 'easy-scraping.com' },
  });
}
function upstream(body: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), {
    status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('Android text-only public board search', () => {
  it('forwards text-only filtering and protects verified empty results from indexing', async () => {
    const fetchMock = upstream({ posts: [], filterApplied: 'text' });
    const response = await GET(request('text'), { params: Promise.resolve({ path }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(new URL(String(fetchMock.mock.calls[0]?.[0])).searchParams.get('media')).toBe('text');
    expect(await response.json()).toEqual({ posts: [], filterApplied: 'text' });
  });
  it.each([
    { posts: [] },
    { posts: [], filterApplied: 'all' },
    { posts: [{ postId: 'invalid', hasImage: false }], filterApplied: 'text' },
    { posts: [{ postId: 'c38c8a0e-3990-4c20-b3be-7796e734cb30', hasImage: true }], filterApplied: 'text' },
  ])('fails closed on unverified success body %j', async (body) => {
    upstream(body);
    const response = await GET(request('text'), { params: Promise.resolve({ path }) });
    expect(response.status).toBe(503);
  });

  it.each([302, 304])('rejects bodyless or redirected upstream %i instead of claiming verified text-only results', async (status) => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status, headers: { location: '/board', etag: 'stale' },
    })));
    const response = await GET(request('text'), { params: Promise.resolve({ path }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('rejects unsupported media without contacting upstream', async () => {
    const fetchMock = upstream({ posts: [], filterApplied: 'text' });
    const response = await GET(request('images'), { params: Promise.resolve({ path }) });
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('does not claim proof on a bodyless HEAD request', async () => {
    const fetchMock = upstream({ posts: [], filterApplied: 'text' });
    const response = await HEAD(request('text', 'HEAD'), { params: Promise.resolve({ path }) });
    expect(response.status).toBe(405);
    expect(await response.text()).toBe('');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
