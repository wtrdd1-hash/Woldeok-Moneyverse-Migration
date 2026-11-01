import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const url = 'https://easy-scraping.com/app-api/v1/board/public/stock-posts';
const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
function setup(payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
  }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android board reply threshold fail-closed contract', () => {
  it('forwards the minimum and protects verified responses from indexing', async () => {
    const fetchMock = setup({ posts: [], minReplies: 5 });
    const response = await GET(new NextRequest(`${url}?minReplies=5`), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(new URL(String(fetchMock.mock.calls[0]?.[0])).searchParams.get('minReplies')).toBe('5');
  });
  it.each(['0', '05', '11', '2&minReplies=5'])('rejects malformed or repeated query %s', async (query) => {
    const fetchMock = setup({ posts: [], minReplies: 5 });
    const response = await GET(new NextRequest(`${url}?minReplies=${query}`), context);
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it.each([
    { posts: [] },
    { posts: [], minReplies: 2 },
    { posts: [{ postId: 'a', commentCount: 1 }], minReplies: 5 },
    { posts: [{ postId: 'a', commentCount: 5 }, { postId: 'a', commentCount: 6 }], minReplies: 5 },
    { posts: [{ postId: 'a', commentCount: '5' }], minReplies: 5 },
  ])('rejects unverifiable success %j', async (payload) => {
    setup(payload);
    const response = await GET(new NextRequest(`${url}?minReplies=5`), context);
    expect(response.status).toBe(503);
  });
});
