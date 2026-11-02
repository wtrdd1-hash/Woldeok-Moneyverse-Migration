import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function request(period: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?period=${period}`, {
    headers: { host: 'easy-scraping.com' },
  });
}
const ctx = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };

describe('Android recent public board period', () => {
  it('rejects duplicate and unknown periods before forwarding', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    const duplicate = new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?period=7d&period=30d');
    expect((await GET(duplicate, ctx)).status).toBe(400);
    expect((await GET(request('week'), ctx)).status).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fails closed on legacy HTTP 200 with no applied period evidence', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts: [] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('7d'), ctx);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('forwards a verified 7-day snapshot with private and noindex headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const payload = { posts: [], period: '7d', cutoffUtc: new Date(Date.now() - 7 * 86_400_000).toISOString() };
    const upstream = vi.fn(async () => new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('7d'), ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('period')).toBe('7d');
    expect(await response.json()).toEqual(payload);
  });
});
