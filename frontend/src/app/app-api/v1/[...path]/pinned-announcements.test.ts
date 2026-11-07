import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
const pinned = {
  announcementId: '00000000-0000-4000-8000-000000000001',
  title: 'Pinned',
  body: 'Body',
  imageUrl: null,
  imageAltText: null,
  isPinned: true,
  publishedAt: null,
};
const context = { params: Promise.resolve({ path: ['content', 'announcements'] }) };
function request(query: string) {
  return new NextRequest('https://easy-scraping.com/app-api/v1/content/announcements' + query);
}

describe('Android public pinned announcements', () => {
  it('forwards the pinned filter and verifies filtered published records', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(
      async () =>
        new Response(JSON.stringify({ announcements: [pinned] }), {
          headers: { 'content-type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchSpy);
    const res = await GET(request('?pinned=true'), context);
    expect(res.status).toBe(200);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain('pinned=true');
  });
  it('rejects duplicates and refuses a success-shaped unfiltered response', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(
      async () =>
        new Response(JSON.stringify({ announcements: [{ ...pinned, isPinned: false }] }), {
          headers: { 'content-type': 'application/json' },
        }),
    );
    vi.stubGlobal('fetch', fetchSpy);
    expect((await GET(request('?pinned=true&pinned=false'), context)).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect((await GET(request('?pinned=true'), context)).status).toBe(503);
  });
});
