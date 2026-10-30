import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android public board title search parity', () => {
  it('forwards the exact title query and prevents indexing query-specific results', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(
      async () =>
        new Response(JSON.stringify({ posts: [] }), {
          headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
        }),
    );
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/board/public/stock-posts?q=WLD%20%25',
      {
        headers: { host: 'easy-scraping.com' },
      },
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const target = new URL(String(upstream.mock.calls[0]?.[0]));
    expect(target.searchParams.get('q')).toBe('WLD %');
    expect(await response.json()).toEqual({ posts: [] });
  });
});
