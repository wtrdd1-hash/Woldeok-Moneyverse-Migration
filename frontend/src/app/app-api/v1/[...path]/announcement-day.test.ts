import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android announcement publication-day discovery', () => {
  function request(search: string) {
    return new NextRequest('https://easy-scraping.com/app-api/v1/content/announcements' + search,
      { headers: { host: 'easy-scraping.com' } });
  }
  const ctx = { params: Promise.resolve({ path: ['content', 'announcements'] }) };

  it('rejects duplicate/invalid days without calling upstream', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    for (const search of ['?day=2026-02-29', '?day=2026-09-18&day=2026-09-19']) {
      const response = await GET(request(search), ctx);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toContain('no-store');
    }
    expect(fetch).not.toHaveBeenCalled();
  });

  it('requires a verified backend day echo and enforces noindex/no-store', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({
      publicationDay: '2026-09-18', announcements: [],
    }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('?day=2026-09-18'), ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('day')).toBe('2026-09-18');
  });

  it('blocks stale success-shaped responses that omit the filter echo', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ announcements: [] }),
      { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('?day=2026-09-18'), ctx);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
