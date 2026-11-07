import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const row = { photoId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad', imageUrl: '/media/photo.jpg', altText: '제주 돌담', publishedAt: '2026-10-31T10:00:00.000Z' };
const ctx = { params: Promise.resolve({ path: ['photos'] }) };
const contentCtx = { params: Promise.resolve({ path: ['content', 'photos'] }) };

function req(q: string) { return new NextRequest(`https://easy-scraping.com/app-api/v1/photos${q}`, { headers: { host: 'easy-scraping.com' } }); }

describe('Android gallery search', () => {
  it('rejects invalid and duplicate filters without reaching upstream', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    for (const q of ['?q=a', '?q=%0Aabc', '?q=abc&q=def']) expect((await GET(req(q), ctx)).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it('forwards valid query but refuses unverified HTTP 200 and never caches search', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ photos: [row] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', upstream);
    const invalid = await GET(req('?q=%EC%A0%9C%EC%A3%BC'), ctx);
    expect(invalid.status).toBe(503);
    upstream.mockImplementation(async () => new Response(JSON.stringify({ photos: [row], searchScope: 'latest_24', searchApplied: true }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    const valid = await GET(req('?q=%EC%A0%9C%EC%A3%BC'), ctx);
    expect(valid.status).toBe(200);
    expect(valid.headers.get('cache-control')).toContain('no-store');
    expect(valid.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('q')).toBe('제주');
  });
  it('also verifies the documented content/photos Android alias', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ photos: [row] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/content/photos?q=%EC%A0%9C%EC%A3%BC', { headers: { host: 'easy-scraping.com' } }), contentCtx);
    expect(response.status).toBe(503);
  });
});
