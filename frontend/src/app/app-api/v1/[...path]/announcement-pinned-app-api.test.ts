import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['content', 'announcements'] }) };
function request(query: string) {
  return new NextRequest('https://easy-scraping.com/app-api/v1/content/announcements' + query, {
    headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
  });
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android pinned-only public notices', () => {
  it('rejects duplicate and unsupported filters without contacting upstream', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    for (const query of ['?pinnedOnly=1&pinnedOnly=1', '?pinnedOnly=0', '?limit=500']) {
      const result = await GET(request(query), context);
      expect(result.status).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('fails closed when legacy backend returns an unfiltered HTTP 200', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      announcements: [{ announcementId: 'id', isPinned: false }],
    }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('?pinnedOnly=1'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('accepts a verified pinned-only response without caching it', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      announcements: [{ announcementId: 'id', isPinned: true }],
    }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } })));
    const response = await GET(request('?pinnedOnly=1'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect((await response.json()).announcements).toHaveLength(1);
  });
});
