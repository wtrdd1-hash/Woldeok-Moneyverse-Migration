import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
function request(author: string) {
  return new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?author=' + author,
    { headers: { host: 'easy-scraping.com' } });
}
function upstream(posts: unknown[], authorFilter?: string) {
  return new Response(JSON.stringify({ posts, ...(authorFilter ? { authorFilter } : {}) }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
  });
}
describe('Android bounded public board author search', () => {
  it('rejects duplicate and malformed author parameters before upstream access', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const fetcher = vi.fn(async () => upstream([]));
    vi.stubGlobal('fetch', fetcher);
    for (const author of ['A&author=B', '%3Cscript%3E', '']) {
      expect((await GET(request(author), context)).status).toBe(400);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('fails closed when an HTTP 200 response does not match the requested public author', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => upstream([{ authorName: 'Other', postId: 'id' }], '김')));
    const response = await GET(request('%EA%B9%80'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('rejects an empty legacy HTTP 200 response that cannot prove author filtering', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => upstream([])));
    expect((await GET(request('%EA%B9%80'), context)).status).toBe(503);
  });
  it('forwards a literal author filter and noindexes a verified bounded result', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetcher = vi.fn(async () => upstream([{ authorName: '김%_', postId: 'id' }], '김%_'));
    vi.stubGlobal('fetch', fetcher);
    const response = await GET(request('%EA%B9%80%25_'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(fetcher.mock.calls[0]?.[0])).searchParams.get('author')).toBe('김%_');
  });
});
