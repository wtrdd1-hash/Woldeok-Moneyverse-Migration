import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const uuid1 = '11111111-1111-4111-8111-111111111111';
const uuid2 = '22222222-2222-4222-8222-222222222222';

function post(postId: string, commentCount: number, createdAt = '2026-11-02T05:00:00.000Z') {
  return { postId, title: 'Public discussion', authorName: 'Member', createdAt, commentCount };
}

async function request(payload: unknown, search = '?sort=discussed') {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  const upstream = vi.fn(async () => new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
  }));
  vi.stubGlobal('fetch', upstream);
  const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts' + search, {
    headers: { host: 'easy-scraping.com' },
  }), { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) });
  return { response, upstream };
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android most-discussed public board parity', () => {
  it('accepts source-verified descending comment counts, including equal-count deterministic ties', async () => {
    const { response, upstream } = await request({
      posts: [post(uuid1, 5), post(uuid2, 2)],
      sortApplied: 'discussed',
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('sort')).toBe('discussed');
  });

  it('rejects legacy empty success without proof of applied sorting', async () => {
    const { response } = await request({ posts: [] });
    expect(response.status).toBe(503);
  });

  it.each([
    { posts: [post(uuid1, 1), post(uuid2, 2)], sortApplied: 'discussed' },
    { posts: [post(uuid1, 2), post(uuid1.toUpperCase(), 1)], sortApplied: 'discussed' },
    { posts: [post(uuid1, -1)], sortApplied: 'discussed' },
    { posts: [post(uuid1, 1)], sortApplied: 'recent' },
  ])('rejects forged or unsorted 200 responses %j', async (payload) => {
    const { response } = await request(payload);
    expect(response.status).toBe(503);
  });

  it('rejects repeated sort parameters before upstream access', async () => {
    const { response, upstream } = await request({ posts: [] }, '?sort=recent&sort=discussed');
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
});
