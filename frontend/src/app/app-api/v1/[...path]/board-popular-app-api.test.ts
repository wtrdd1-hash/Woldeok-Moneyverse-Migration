import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const path = ['board', 'public', 'stock-posts'];
const id1 = '123e4567-e89b-42d3-a456-426614174001';
const id2 = '123e4567-e89b-42d3-a456-426614174002';
const post = (postId: string, commentCount: number) => ({ postId, commentCount, createdAt: '2026-11-01T12:00:00.000Z' });
const valid = { posts: [post(id1, 3), post(id2, 1)], appliedSort: { order: 'popular', scope: 'latest50' } };

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

describe('Android popular public board ordering', () => {
  it('forwards validated sort and returns noncacheable verified order', async () => {
    const { response, upstream } = await run('?stock=WDX&q=help&sort=popular', valid);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('sort')).toBe('popular');
  });
  it('accepts recent ordering without a popular proof marker', async () => {
    const { response, upstream } = await run('?sort=recent', { posts: [] });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('sort')).toBe('recent');
  });
  it.each(['?sort=', '?sort=oldest', '?sort=popular&sort=popular', '?sort=popular&unknown=1', '?sort=popular&q=x&q=y'])('rejects invalid query %s', async (query) => {
    const { response, upstream } = await run(query, valid);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it.each([{ posts: valid.posts }, { ...valid, posts: [post(id1, 1), post(id2, 2)] }, { ...valid, posts: [post(id1, 1), post(id1.toUpperCase(), 0)] }])('fails closed on unverified upstream success', async (payload) => {
    const { response } = await run('?sort=popular', payload);
    expect(response.status).toBe(503);
  });
});
