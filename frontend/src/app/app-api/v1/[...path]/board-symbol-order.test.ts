import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const id1 = '11111111-1111-4111-8111-111111111111';
const id2 = '22222222-2222-4222-8222-222222222222';
const post = (postId: string, symbol: string | null) => ({
  postId, title: 'Test', authorName: 'Member', createdAt: '2026-11-02T00:00:00.000Z',
  updatedAt: null, commentCount: 0, mine: false, hasImage: false,
  stock: symbol ? { stockId: id1, symbol, name: symbol, category: 'general', stance: 'none', positionDisclosure: 'undisclosed' } : null,
});

async function run(payload: unknown, query = 'sort=stock-symbol') {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
  })));
  return GET(new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?${query}`, {
    headers: { host: 'easy-scraping.com' },
  }), { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) });
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android public board symbol order proof', () => {
  it('accepts source-verified sorted posts and applies private anti-index headers', async () => {
    const response = await run({ posts: [post(id1, 'AAA'), post(id2, 'WDX')], sortApplied: 'stock-symbol' });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it('rejects a stale backend that silently ignores sort even for empty results', async () => {
    expect((await run({ posts: [] })).status).toBe(503);
  });
  it('rejects misordered, duplicated or malformed stock records', async () => {
    for (const rows of [[post(id2, 'WDX'), post(id1, 'AAA')], [post(id1, 'AAA'), post(id1, 'WDX')], [post(id1, 'BAD!')]]) {
      expect((await run({ posts: rows, sortApplied: 'stock-symbol' })).status).toBe(503);
    }
  });
  it('rejects duplicate or unsupported sort query values', async () => {
    expect((await run({ posts: [] }, 'sort=stock-symbol&sort=recent')).status).toBe(400);
    expect((await run({ posts: [] }, 'sort=bogus')).status).toBe(400);
  });
});
