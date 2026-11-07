import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
const url = 'https://easy-scraping.com/app-api/v1/board/public/stock-posts';
function request(query: string) { return new NextRequest(`${url}${query}`, { headers: { host: 'easy-scraping.com' } }); }
function upstream(posts: unknown, headers: Record<string, string> = {}) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', ...headers } })));
}
const post = { postId: '123e4567-e89b-42d3-a456-426614174000', stock: { category: 'analysis' } };

describe('Android stock discussion category filter', () => {
  it('forwards a valid category and verifies the returned category with no-store/noindex', async () => {
    upstream([post]);
    const response = await GET(request('?category=analysis'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(await response.json()).toEqual({ posts: [post] });
  });
  it.each(['?category=analysis&category=question', '?category=all', '?category=unknown'])('rejects invalid query %s before proxy', async (query) => {
    upstream([]);
    expect((await GET(request(query), context)).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each([[{ ...post, stock: { category: 'question' } }], [{ ...post, stock: null }], [post, post]])('rejects unverified HTTP 200 results', async (posts) => {
    upstream(posts);
    const response = await GET(request('?category=analysis'), context);
    expect(response.status).toBe(503);
  });
});
