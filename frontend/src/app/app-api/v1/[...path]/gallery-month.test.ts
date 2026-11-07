import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const request = (query: string) => new NextRequest(
  `https://easy-scraping.com/app-api/v1/photos${query}`,
  { headers: { host: 'easy-scraping.com' } },
);
const context = { params: Promise.resolve({ path: ['photos'] }) };
const response = (payload: unknown) => new Response(JSON.stringify(payload), {
  status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
});

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android public gallery Seoul month', () => {
  it('rejects duplicate, invalid and unknown query keys before upstream', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => response({ photos: [] }));
    vi.stubGlobal('fetch', upstream);
    for (const query of ['?month=2026-13', '?month=2026-11&month=2026-10', '?month=2026-11&other=1']) {
      expect((await GET(request(query), context)).status).toBe(400);
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it('fails closed on a legacy ignored filter and mismatched photo dates', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => response({ photos: [] }));
    vi.stubGlobal('fetch', upstream);
    const legacy = await GET(request('?month=2026-11'), context);
    expect(legacy.status).toBe(503);
    upstream.mockImplementationOnce(async () => response({ month: '2026-11', photos: [{
      photoId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad', imageUrl: '/media/x.jpg',
      altText: 'approved', publishedAt: '2026-10-31T14:59:59Z',
    }] }));
    expect((await GET(request('?month=2026-11'), context)).status).toBe(503);
  });
  it('forwards the month, validates an empty verified result, and prevents caching/indexing', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => response({ month: '2026-11', photos: [] }));
    vi.stubGlobal('fetch', upstream);
    const result = await GET(request('?month=2026-11'), context);
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toContain('no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('month')).toBe('2026-11');
    expect(await result.json()).toEqual({ month: '2026-11', photos: [] });
  });
});
