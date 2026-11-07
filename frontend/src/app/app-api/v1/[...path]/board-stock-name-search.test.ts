import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

const path = ['board', 'public', 'stock-posts'];
const context = { params: Promise.resolve({ path }) };
const make = (query: string, method = 'GET') => new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?${query}`, { method });
const source = (data: unknown) => new Response(JSON.stringify(data), {
  headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
});

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Android bounded public stock-name search', () => {
  it('rejects ambiguous queries before proxying', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const response = await GET(make('stockName=A&stockName=B'), context);
    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('fails closed for a legacy HTTP 200 with unverified empty results', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => source({ posts: [] })));
    const response = await GET(make('stockName=%EC%A0%9C%EC%A3%BC'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('passes verified empty results with no-store, noindex and no-referrer', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetcher = vi.fn(async () => source({ posts: [], stockNameFilter: '제주', sourceWindow: 50 }));
    vi.stubGlobal('fetch', fetcher);
    const response = await GET(make('stockName=%EC%A0%9C%EC%A3%BC'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(new URL(String(fetcher.mock.calls[0]![0])).searchParams.get('stockName')).toBe('제주');
  });
  it('rejects a verified-looking result that ignores the requested stock name', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => source({
      posts: [{ postId: '123e4567-e89b-42d3-a456-426614174000', title: 'News',
        authorName: 'Guest', createdAt: '2026-11-02T00:00:00Z', commentCount: 0,
        stock: { name: '서울', symbol: 'WDX' } }],
      stockNameFilter: '제주', sourceWindow: 50,
    })));
    const response = await GET(make('stockName=%EC%A0%9C%EC%A3%BC'), context);
    expect(response.status).toBe(503);
  });
  it('refuses filtered HEAD because a body cannot prove filtering', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => source({ posts: [], stockNameFilter: '제주', sourceWindow: 50 })));
    const response = await HEAD(make('stockName=%EC%A0%9C%EC%A3%BC', 'HEAD'), context);
    expect(response.status).toBe(503);
  });
});
