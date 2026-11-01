import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['content', 'announcements'] }) };
const notice = (id: string, publishedAt: string) => ({ announcementId: id, publishedAt, title: 'Published', body: 'public', isPinned: false });
const older = notice('00000000-0000-4000-8000-000000000001', '2026-09-01T00:00:00.000Z');
const newer = notice('00000000-0000-4000-8000-000000000002', '2026-10-01T00:00:00.000Z');
const request = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/content/announcements${query}`);

beforeEach(() => { vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32)); vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android public announcement sort', () => {
  it('rejects malformed or duplicated query without calling backend', async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const query of ['?sort=oldest&sort=newest', '?sort=invalid', '?sort=oldest&secret=1']) {
      const response = await GET(request(query), context);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toContain('no-store');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('rejects stale upstream 200 that ignores requested sort', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ announcements: [newer, older] }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('?sort=oldest'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('forwards verified order with no-store/noindex even if upstream is public-cacheable', async () => {
    const spy = vi.fn(async () => new Response(JSON.stringify({ announcements: [older, newer] }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', spy);
    const response = await GET(request('?sort=oldest'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(spy.mock.calls[0]?.[0])).searchParams.get('sort')).toBe('oldest');
  });
});
