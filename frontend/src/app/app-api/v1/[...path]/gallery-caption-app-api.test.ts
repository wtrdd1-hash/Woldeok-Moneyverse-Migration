import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const context = { params: Promise.resolve({ path: ['photos'] }) };
function request(query: string) {
  return new NextRequest('https://example.com/app-api/v1/photos' + query, {
    headers: { host: 'example.com', 'x-forwarded-proto': 'https' },
  });
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android gallery caption filter', () => {
  it('rejects duplicate or unsupported filters without upstream requests', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://example.com');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    for (const query of ['?q=a', '?q=%20', '?q=abc&q=abc', '?limit=100']) {
      expect((await GET(request(query), context)).status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejects legacy unfiltered HTTP 200 and disables caching', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://example.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      photos: [{ photoId: 'id', altText: '부산', imageUrl: '/media/a.jpg', publishedAt: null }],
    }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const result = await GET(request('?q=%EC%A0%9C%EC%A3%BC'), context);
    expect(result.status).toBe(503);
    expect(result.headers.get('cache-control')).toContain('no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('also protects the app content/photos alias against stale unfiltered results', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://example.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      photos: [{ photoId: 'id', altText: '부산', imageUrl: '/media/a.jpg', publishedAt: null }],
    }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const alias = { params: Promise.resolve({ path: ['content', 'photos'] }) };
    const result = await GET(new NextRequest('https://example.com/app-api/v1/content/photos?q=%EC%A0%9C%EC%A3%BC', {
      headers: { host: 'example.com', 'x-forwarded-proto': 'https' },
    }), alias);
    expect(result.status).toBe(503);
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('accepts verified caption matches without inheriting public caching', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://example.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      photos: [{ photoId: 'id', altText: '제주 바다', imageUrl: '/media/a.jpg', publishedAt: null }],
    }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } })));
    const result = await GET(request('?q=%EC%A0%9C%EC%A3%BC'), context);
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toContain('no-store');
    expect((await result.json()).photos).toHaveLength(1);
  });
});
