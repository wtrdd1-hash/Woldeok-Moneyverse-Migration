import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['content', 'announcements'] }) };
const req = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/content/announcements${query}`);
const row = { announcementId: '00000000-0000-4000-8000-000000000001', body: '경제 서버 점검', title: '공개 공지', publishedAt: '2026-10-01T00:00:00.000Z' };

beforeEach(() => { vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32)); vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android published announcement body search', () => {
  it('rejects invalid body before fetching backend', async () => {
    const spy = vi.fn(); vi.stubGlobal('fetch', spy);
    for (const q of ['?body=a&body=b', '?body=', '?body=%3Cscript%3E', '?body=a&secret=1']) {
      const response = await GET(req(q), context);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toContain('no-store');
    }
    expect(spy).not.toHaveBeenCalled();
  });
  it('rejects success-shaped upstream that ignored body filter', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ announcements: [{ ...row, body: 'irrelevant' }] }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const response = await GET(req('?body=%EC%84%9C%EB%B2%84'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('forwards body and preserves no-store/noindex on verified response', async () => {
    const spy = vi.fn(async () => new Response(JSON.stringify({ announcements: [row] }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' } }));
    vi.stubGlobal('fetch', spy);
    const response = await GET(req('?body=%EC%84%9C%EB%B2%84'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(spy.mock.calls[0]?.[0])).searchParams.get('body')).toBe('서버');
  });
});
