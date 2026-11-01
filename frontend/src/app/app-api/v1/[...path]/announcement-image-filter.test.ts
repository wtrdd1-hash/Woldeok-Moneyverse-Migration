import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const ctx = { params: Promise.resolve({ path: ['content', 'announcements'] }) };
const origin = 'https://easy-scraping.com/app-api/v1/content/announcements';
const headers = { host: 'easy-scraping.com' };
const photo = { announcementId: 'e0b4d58d-4b10-47cc-9894-46eb3d2d1718', title: 'Image', imageUrl: '/media/e0b4d58d-4b10-47cc-9894-46eb3d2d1718.jpg', publishedAt: '2026-09-01T00:00:00.000Z' };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android announcement image-only filter', () => {
  function setup(payload: unknown) {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetcher = vi.fn(async () => new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=600' } }));
    vi.stubGlobal('fetch', fetcher);
    return fetcher;
  }
  it('forwards and verifies the filtered response and forbids caching', async () => {
    const fetcher = setup({ announcements: [photo], filterApplied: 'with-image', sourceLimit: 20 });
    const response = await GET(new NextRequest(origin + '?withImage=1', { headers }), ctx);
    expect(response.status).toBe(200);
    expect(new URL(String(fetcher.mock.calls[0]?.[0])).searchParams.get('withImage')).toBe('1');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it.each(['withImage=0', 'withImage=true', 'withImage=1&withImage=1', 'withImage=1&bad=1'])(
    'rejects invalid query %s', async (query) => {
      const fetcher = setup({ announcements: [photo] });
      expect((await GET(new NextRequest(origin + '?' + query, { headers }), ctx)).status).toBe(400);
      expect(fetcher).not.toHaveBeenCalled();
    },
  );
  it.each([{ announcements: [photo] }, { announcements: [photo], filterApplied: 'with-image' }, { announcements: [{ ...photo, imageUrl: null }], filterApplied: 'with-image', sourceLimit: 20 }, { announcements: [photo, photo], filterApplied: 'with-image', sourceLimit: 20 }, { announcements: null, filterApplied: 'with-image', sourceLimit: 20 }])(
    'fails closed on unverified 200 payload', async (payload) => {
      setup(payload);
      expect((await GET(new NextRequest(origin + '?withImage=1', { headers }), ctx)).status).toBe(503);
    },
  );
});
