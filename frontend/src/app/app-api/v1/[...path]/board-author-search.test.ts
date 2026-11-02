import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const path = ['board', 'public', 'stock-posts'];
const request = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?${query}`, { headers: { host: 'easy-scraping.com' } });
const setup = (body: unknown) => {
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  const fetcher = vi.fn(async () => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=600' } }));
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
};

describe('Android author filter evidence', () => {
  it('rejects legacy success-shaped empty results without proof', async () => {
    setup({ posts: [] });
    const res = await GET(request('author=%ED%99%8D'), { params: Promise.resolve({ path }) });
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('accepts proven empty results and forwards normalized author', async () => {
    const fetcher = setup({ posts: [], authorFilter: '홍', sourceWindow: 50 });
    const res = await GET(request('author=%20%ED%99%8D%20'), { params: Promise.resolve({ path }) });
    expect(res.status).toBe(200);
    expect(new URL(String(fetcher.mock.calls[0]?.[0])).searchParams.get('author')).toBe('홍');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('fails closed when a legacy backend claims success but returns a different author', async () => {
    setup({ authorFilter: '홍', sourceWindow: 50, posts: [{
      postId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', authorName: '김', title: '안내',
      createdAt: '2026-11-02T10:00:00.000Z', commentCount: 0,
    }] });
    const res = await GET(request('author=%ED%99%8D'), { params: Promise.resolve({ path }) });
    expect(res.status).toBe(503);
  });
  it('rejects duplicate UUIDs differing only by case, even with valid proof', async () => {
    const item = { postId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', authorName: '홍길동',
      title: '안내', createdAt: '2026-11-02T10:00:00.000Z', commentCount: 0 };
    setup({ authorFilter: '홍', sourceWindow: 50, posts: [item, { ...item, postId: item.postId.toUpperCase() }] });
    const res = await GET(request('author=%ED%99%8D'), { params: Promise.resolve({ path }) });
    expect(res.status).toBe(503);
  });
  it('rejects HEAD for filtered author search without contacting upstream', async () => {
    const fetcher = setup({ authorFilter: '홍', sourceWindow: 50, posts: [] });
    const head = new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?author=%ED%99%8D', { method: 'HEAD', headers: { host: 'easy-scraping.com' } });
    const { HEAD } = await import('./route');
    const res = await HEAD(head, { params: Promise.resolve({ path }) });
    expect(res.status).toBe(405);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('rejects repeated and invalid author parameters before proxying', async () => {
    const fetcher = setup({ posts: [] });
    const res = await GET(request('author=a&author=b'), { params: Promise.resolve({ path }) });
    expect(res.status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
});
