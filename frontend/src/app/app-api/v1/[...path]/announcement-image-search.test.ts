import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function request(query: string) {
  return new NextRequest('https://easy-scraping.com/app-api/v1/content/announcements' + query, {
    headers: { host: 'easy-scraping.com' },
  });
}
const context = { params: Promise.resolve({ path: ['content', 'announcements'] }) };

describe('Android published announcement image description search', () => {
  it('forwards literal query and forces no-store/noindex on verified filtered results', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ announcements: [{
      announcementId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad', title: 'Notice', body: 'Details',
      imageUrl: '/media/test.jpg', imageAltText: '제주 %_ 바다', isPinned: false,
      publishedAt: '2026-11-03T00:00:00.000Z',
    }] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', fetcher);
    const response = await GET(request('?imageAlt=%EC%A0%9C%EC%A3%BC%20%25_'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(fetcher.mock.calls[0]?.[0])).searchParams.get('imageAlt')).toBe('제주 %_');
  });

  it('rejects duplicate, unsafe and unsupported filters before backend access', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    for (const query of ['?imageAlt=a', '?imageAlt=x&imageAlt=y', '?imageAlt=%3Cimg%3E', '?unknown=yes']) {
      const response = await GET(request(query), context);
      expect(response.status).toBe(400);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fails closed on success-shaped upstream records that do not match the image query', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ announcements: [{
      announcementId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad', title: 'Notice', body: 'Details',
      imageUrl: null, imageAltText: null, isPinned: false, publishedAt: null,
    }] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('?imageAlt=%EB%B0%94%EB%8B%A4'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
