import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const id = '123e4567-e89b-42d3-a456-426614174000';
const path = ['board', 'public', 'stock-posts'];

async function run(query: string, payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  const upstream = vi.fn(async () => new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
  }));
  vi.stubGlobal('fetch', upstream);
  const response = await GET(new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts${query}`, {
    headers: { host: 'easy-scraping.com' },
  }), { params: Promise.resolve({ path }) });
  return { response, upstream };
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android unanswered board filter', () => {
  it('forwards only the validated flag, preserving title and stock', async () => {
    const { response, upstream } = await run('?stock=WDX&q=help&unanswered=1', { posts: [{ postId: id, commentCount: 0 }], appliedFilters: { unansweredOnly: true, scope: 'latest50' } });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const url = new URL(String(upstream.mock.calls[0]?.[0]));
    expect(url.searchParams.get('unanswered')).toBe('1');
    expect(url.searchParams.get('q')).toBe('help');
    expect(url.searchParams.get('stock')).toBe('WDX');
  });
  it.each(['?unanswered=0', '?unanswered=1&unanswered=1', '?unanswered=true', '?unanswered=1&unknown=1'])('rejects invalid filters without forwarding %s', async (query) => {
    const { response, upstream } = await run(query, { posts: [] });
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it.each([{ posts: [{ postId: id, commentCount: 2 }], appliedFilters: { unansweredOnly: true, scope: 'latest50' } }, { posts: [{ postId: id }], appliedFilters: { unansweredOnly: true, scope: 'latest50' } }, { posts: [{ postId: id, commentCount: 0 }, { postId: id.toUpperCase(), commentCount: 0 }], appliedFilters: { unansweredOnly: true, scope: 'latest50' } }, { posts: 'none' }])(
    'rejects unverified HTTP 200 payload %j', async (payload) => {
      const { response } = await run('?unanswered=1', payload);
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toContain('no-store');
    },
  );
});
