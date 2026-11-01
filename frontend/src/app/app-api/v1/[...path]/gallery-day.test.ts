import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const photo = {
  photoId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad',
  imageUrl: '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg',
  altText: 'Approved',
  publishedAt: '2026-09-06T15:00:00.000Z',
};
const context = { params: Promise.resolve({ path: ['content', 'photos'] }) };
const request = (search: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/content/photos${search}`, { headers: { host: 'easy-scraping.com' } });

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android gallery Seoul-day contract', () => {
  it('rejects duplicate or invalid day before contacting the backend', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    for (const search of ['?day=2026-09-07&day=2026-09-08', '?day=2026-02-30', '?day=2026-09-07&debug=1']) {
      expect((await GET(request(search), context)).status).toBe(400);
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it('rejects an upstream 200 that ignored the date filter', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ photos: [{ ...photo, publishedAt: '2026-09-05T15:00:00Z' }] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('?day=2026-09-07'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it.each(['html', 'no-content'])('rejects a success-shaped %s response without verified photo JSON', async (kind) => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => kind === 'html'
      ? new Response('<html>unverified</html>', { status: 200, headers: { 'content-type': 'text/html' } })
      : new Response(null, { status: 204 })));
    const response = await GET(request('?day=2026-09-07'), context);
    expect(response.status).toBe(503);
  });
  it('accepts a verified day result and never caches or indexes it', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ photos: [photo] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('?day=2026-09-07'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('day')).toBe('2026-09-07');
  });
});
