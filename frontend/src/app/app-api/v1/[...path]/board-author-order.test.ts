import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const id1 = '11111111-2222-4333-8444-555555555555';
const id2 = '22222222-3333-4444-8555-666666666666';
const ctx = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
const url = (q: string) => `https://easy-scraping.com/app-api/v1/board/public/stock-posts${q}`;
function request(q: string) { return new NextRequest(url(q), { headers: { host: 'easy-scraping.com' } }); }
function upstream(payload: unknown) {
  return new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' } });
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android public board author order', () => {
  it('rejects repeated and unknown sort without contacting upstream', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    for (const q of ['?sort=author&sort=author', '?sort=recent', '?sort=']) {
      expect((await GET(request(q), ctx)).status).toBe(400);
    }
    expect(fetch).not.toHaveBeenCalled();
  });
  it('requires proof even on empty results, and protects query-specific cache and indexing', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetch = vi.fn(async () => upstream({ sortApplied: 'author', posts: [] })); vi.stubGlobal('fetch', fetch);
    const response = await GET(request('?sort=author&stock=WDX'), ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(new URL(String(fetch.mock.calls[0]?.[0])).searchParams.get('sort')).toBe('author');
    expect(await response.json()).toEqual({ sortApplied: 'author', posts: [] });
  });
  it('blocks stale, unsorted and duplicate-ID success responses', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    for (const payload of [
      { posts: [] },
      { sortApplied: 'author', posts: [{ postId: id1, authorName: 'Zoe' }, { postId: id2, authorName: 'Alice' }] },
      { sortApplied: 'author', posts: [{ postId: id1.toUpperCase(), authorName: 'Alice' }, { postId: id1, authorName: 'Alice' }] },
    ]) {
      vi.stubGlobal('fetch', vi.fn(async () => upstream(payload)));
      const response = await GET(request('?sort=author'), ctx);
      expect(response.status).toBe(503);
    }
  });
});
