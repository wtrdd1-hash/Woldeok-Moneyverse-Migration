import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const A = '2e090c86-3cd8-47ca-b7db-4be7d7b8daad';
const B = '7eede72c-432b-4a45-8ba6-420dd24350c7';
const photo = (photoId: string, altText: string) => ({
  photoId, altText, imageUrl: `/media/${photoId}.jpg`, publishedAt: '2026-11-01T00:00:00.000Z',
});
const context = { params: Promise.resolve({ path: ['photos'] }) };
function request(query: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/photos${query}`, {
    headers: { host: 'easy-scraping.com' },
  });
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android approved-gallery caption sort', () => {
  it('forwards caption order and marks verified results nonindexable', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ photos: [photo(A, 'Alpha'), photo(B, '바다')] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('?sort=caption'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('sort')).toBe('caption');
  });

  it('rejects a success-shaped upstream that ignored the requested sort', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ photos: [photo(B, '바다'), photo(A, 'Alpha')] }), {
      headers: { 'content-type': 'application/json' },
    })));
    const response = await GET(request('?sort=caption'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it.each(['?sort=caption&sort=caption', '?sort=latest', '?other=1'])(
    'rejects invalid Android gallery query %s before calling upstream', async (query) => {
      vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
      vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
      const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
      expect((await GET(request(query), context)).status).toBe(400);
      expect(upstream).not.toHaveBeenCalled();
    },
  );
});
