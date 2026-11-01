import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const path = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
const origin = 'https://easy-scraping.com/app-api/v1/board/public/stock-posts';
const headers = { host: 'easy-scraping.com' };
const photo = { postId: 'e0b4d58d-4b10-47cc-9894-46eb3d2d1718', title: 'Photo', hasImage: true };

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android public board image-only parity', () => {
  it('forwards the filter, verifies image-only rows and prevents indexing or caching', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ posts: [photo] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
    }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(new NextRequest(origin + '?stock=WDX&withImage=1', { headers }), path);
    expect(response.status).toBe(200);
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('withImage')).toBe('1');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(await response.json()).toEqual({ posts: [photo] });
  });
  it.each(['withImage=0', 'withImage=true', 'withImage=', 'withImage=1&withImage=1', 'withImage=1&bad=1'])(
    'rejects invalid query %s before proxying', async (query) => {
      vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
      vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
      const upstream = vi.fn();
      vi.stubGlobal('fetch', upstream);
      const response = await GET(new NextRequest(origin + '?' + query, { headers }), path);
      expect(response.status).toBe(400);
      expect(upstream).not.toHaveBeenCalled();
    },
  );
  it.each([{ posts: [{ ...photo, hasImage: false }] }, { posts: [{ ...photo, hasImage: 'yes' }] },
    { posts: [{ ...photo }, { ...photo }] }, { posts: null }, { posts: Array.from({ length: 51 }, () => photo) }])(
    'fails closed on an unverified success payload %j', async (payload) => {
      vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
      vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
      vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), {
        headers: { 'content-type': 'application/json' },
      })));
      const response = await GET(new NextRequest(origin + '?withImage=1', { headers }), path);
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toContain('no-store');
    },
  );
});
