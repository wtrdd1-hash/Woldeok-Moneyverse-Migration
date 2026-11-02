import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function request(alt: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?alt=${encodeURIComponent(alt)}`, { headers: { host: 'easy-scraping.com' } });
}
const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };

describe('Android public board image-description search', () => {
  it('forwards literal query, requires proof and suppresses indexing and caching', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ posts: [], appliedImageAltQuery: '제주 %_' }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('제주 %_'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('alt')).toBe('제주 %_');
  });
  it('rejects unverified success-shaped response instead of inventing empty matches', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts: [] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('sunset'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
