import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

const path = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
const a = { postId: '11111111-1111-4111-8111-111111111111', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z' };
const b = { postId: '22222222-2222-4222-8222-222222222222', createdAt: '2026-10-25T00:00:00.000Z', updatedAt: null };

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android public board updated order source proof', () => {
  function setup(payload: unknown, status = 200) {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    return upstream;
  }
  it('passes a verified ordered snapshot with private no-store and noindex', async () => {
    const upstream = setup({ order: 'updated', posts: [a, b] });
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?order=updated'), path);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('order')).toBe('updated');
  });
  it.each([
    { posts: [] },
    { order: 'updated', posts: [b, a] },
    { order: 'updated', posts: [a, {...a, postId: a.postId.toUpperCase()}] },
  ])('fails closed on unverified success %#', async (payload) => {
    setup(payload);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?order=updated'), path);
    expect(response.status).toBe(503);
  });
  it.each(['order=updated&order=updated', 'order=oldest', 'order='])('rejects invalid query before upstream', async (query) => {
    const upstream = setup({ posts: [] });
    const response = await GET(new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?${query}`), path);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it('allows the explicit latest default without requesting unverified update ordering', async () => {
    setup({ posts: [] });
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?order=latest'), path);
    expect(response.status).toBe(200);
  });
  it('does not return unverifiable HEAD success', async () => {
    setup({ order: 'updated', posts: [a] });
    const response = await HEAD(new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?order=updated', {method:'HEAD'}), path);
    expect(response.status).toBe(503);
  });
});
