import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function request(query: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?${query}`, { headers: { host: 'easy-scraping.com' } });
}
const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };

describe('Android public board author filter', () => {
  it.each(['author=a&author=b', 'author=', 'author=%3Cb%3E', 'author=' + 'x'.repeat(41)])(
    'rejects invalid author filter before upstream fetch: %s', async (query) => {
      const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
      const response = await GET(request(query), context);
      expect(response.status).toBe(400); expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it('rejects an unfiltered HTTP 200 result and never caches it', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts: [{ authorName: 'other' }] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } })));
    const response = await GET(request('author=%EB%AF%BC%EC%88%98'), context);
    expect(response.status).toBe(503); expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('forwards author filter and returns only matching verified public results', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ posts: [{ authorName: '김민수' }] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', fetcher);
    const response = await GET(request('author=%EB%AF%BC%EC%88%98'), context);
    expect(response.status).toBe(200); expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(new URL(String(fetcher.mock.calls[0]?.[0])).searchParams.get('author')).toBe('민수');
  });
});
