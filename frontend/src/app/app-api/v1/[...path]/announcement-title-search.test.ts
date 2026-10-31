import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const context = { params: Promise.resolve({ path: ['announcements'] }) };
const request = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/announcements?${query}`, { headers: { host: 'easy-scraping.com' } });
beforeEach(() => { vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32)); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android public announcement search', () => {
  it('rejects duplicate and invalid filters before upstream access', async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const query of ['q=a&q=b', 'q=%20', 'q=abc&limit=51', 'limit=01', 'limit=50&limit=20']) {
      expect((await GET(request(query), context)).status).toBe(400);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('rejects upstream 200 results that ignore title filtering', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ announcements: [{ announcementId: '11111111-1111-4111-8111-111111111111', title: 'Unrelated', body: 'x', imageUrl: null, imageAltText: null, isPinned: false, publishedAt: '2026-10-31T00:00:00.000Z' }] }), { headers: { 'content-type': 'application/json' } })));
    expect((await GET(request('q=notice&limit=50'), context)).status).toBe(503);
  });
  it('accepts verified matching public notices and forwards the query', async () => {
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ announcements: [{ announcementId: '11111111-1111-4111-8111-111111111111', title: 'Notice', body: 'x', imageUrl: null, imageAltText: null, isPinned: false, publishedAt: '2026-10-31T00:00:00.000Z' }] }), { headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchSpy);
    expect((await GET(request('q=notice&limit=50'), context)).status).toBe(200);
    expect(new URL(String(fetchSpy.mock.calls[0]![0])).searchParams.get('q')).toBe('notice');
  });
});
