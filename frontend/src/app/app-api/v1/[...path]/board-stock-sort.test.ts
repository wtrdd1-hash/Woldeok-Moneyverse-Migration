import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const row = (symbol: string | null, id: string) => ({
  postId: id, createdAt: '2026-11-01T00:00:00.000Z',
  stock: symbol === null ? null : { symbol },
});

async function request(posts: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts, sortApplied: 'stock' }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
  })));
  return GET(new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?sort=stock', {
    headers: { host: 'easy-scraping.com' },
  }), { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) });
}

describe('Android public board stock order proof', () => {
  it('accepts verified ordering and prevents public caching or indexing', async () => {
    const res = await request([row('AAA', '11111111-1111-4111-8111-111111111111'), row('WDX', '22222222-2222-4222-8222-222222222222'), row(null, '33333333-3333-4333-8333-333333333333')]);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects untagged-first rows and repeated post identities', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    expect((await request([row(null, id), row('AAA', '22222222-2222-4222-8222-222222222222')])).status).toBe(503);
    expect((await request([row('AAA', id), row('AAA', id.toUpperCase())])).status).toBe(503);
  });
  it('fails closed on unverified ordering', async () => {
    const res = await request([row('WDX', '11111111-1111-4111-8111-111111111111'), row('AAA', '22222222-2222-4222-8222-222222222222')]);
    expect(res.status).toBe(503);
  });
});
