import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android public board title search parity', () => {
  it('forwards the exact title query and prevents indexing query-specific results', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(
      async () =>
        new Response(JSON.stringify({ posts: [] }), {
          headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
        }),
    );
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/board/public/stock-posts?q=WLD%20%25',
      {
        headers: { host: 'easy-scraping.com' },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const target = new URL(String(upstream.mock.calls[0]?.[0]));
    expect(target.searchParams.get('q')).toBe('WLD %');
    expect(await response.json()).toEqual({ posts: [] });
  });
});


describe('Android minimum replies proof', () => {
  const request = () => new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?minReplies=5', { headers: { host: 'easy-scraping.com' } });
  const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
  it('rejects an upstream success with too few replies', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts: [{ postId: '11111111-1111-4111-8111-111111111111', commentCount: 2 }] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request(), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('accepts verified matching rows and blocks indexing', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ posts: [{ postId: '11111111-1111-4111-8111-111111111111', commentCount: 5 }], filters: { minReplies: 5, scope: 'latest50' } }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } }));
    vi.stubGlobal('fetch', fetcher);
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(new URL(String(fetcher.mock.calls[0]?.[0])).searchParams.get('minReplies')).toBe('5');
  });
  it('rejects an unproven empty success, not inventing a verified empty result', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts: [] }), { headers: { 'content-type': 'application/json' } })));
    expect((await GET(request(), context)).status).toBe(503);
  });
  it('accepts a proven empty result and rejects duplicated post identities', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const row = { postId: '11111111-1111-4111-8111-111111111111', commentCount: 5 };
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ posts: [], filters: { minReplies: 5, scope: 'latest50' } }), { headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetcher);
    expect((await GET(request(), context)).status).toBe(200);
    fetcher.mockImplementation(async () => new Response(JSON.stringify({ posts: [row, row], filters: { minReplies: 5, scope: 'latest50' } }), { headers: { 'content-type': 'application/json' } }));
    expect((await GET(request(), context)).status).toBe(503);
  });
  it('rejects duplicated filter values before contacting upstream', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?minReplies=1&minReplies=5', { headers: { host: 'easy-scraping.com' } }), context);
    expect(response.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
