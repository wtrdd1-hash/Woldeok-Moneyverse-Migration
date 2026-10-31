import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const endpoint = 'https://easy-scraping.com/app-api/v1/content/announcements';
function request(query: string) {
  return new NextRequest(endpoint + query, { headers: { host: 'easy-scraping.com' } });
}
const ctx = { params: Promise.resolve({ path: ['content', 'announcements'] }) };

describe('Android announcement search source proof', () => {
  it('rejects duplicates before forwarding', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('?q=%EA%B3%B5%EC%A7%80&q=%EC%86%8C%EC%8B%9D'), ctx);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it('rejects stale HTTP 200 with nonmatching titles', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      announcements: [{ announcementId: '11111111-1111-4111-8111-111111111111', title: '다른 제목', body: '안내', isPinned: false, publishedAt: '2026-10-30T00:00:00Z' }],
    }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('?q=%EA%B3%B5%EC%A7%80'), ctx);
    expect(response.status).toBe(503);
  });
  it('accepts verified matches with no-store/noindex', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({
      announcements: [{ announcementId: '11111111-1111-4111-8111-111111111111', title: '중요 공지', body: '안내', isPinned: false, publishedAt: '2026-10-30T00:00:00Z' }],
    }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('?q=%EA%B3%B5%EC%A7%80'), ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('q')).toBe('공지');
  });
});
