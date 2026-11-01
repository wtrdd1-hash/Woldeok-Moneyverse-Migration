import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const ctx = { params: Promise.resolve({ path: ['board','public','stock-posts'] }) };
function req(query: string) {
  return new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?' + query,
    { headers: { host: 'easy-scraping.com' } });
}
function setup(payload: unknown, status = 200) {
  vi.stubEnv('APP_BASE_URL','https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN','test-only');
  const upstream = vi.fn(async () => new Response(JSON.stringify(payload), {
    status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
  }));
  vi.stubGlobal('fetch', upstream);
  return upstream;
}
const newer = { postId: 'b', createdAt: '2026-11-01T03:00:00.000Z' };
const older = { postId: 'a', createdAt: '2026-11-01T01:00:00.000Z' };

describe('Android board order proof', () => {
  it('accepts proved oldest rows, forwards order and prevents caching/indexing', async () => {
    const upstream = setup({ posts: [older,newer], order: 'oldest' });
    const res = await GET(req('order=oldest'),ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('order')).toBe('oldest');
  });
  it.each(['order=oldest&order=newest','order=invalid','order='])('rejects invalid %s before upstream', async q => {
    const upstream = setup({ posts: [] });
    const res = await GET(req(q),ctx);
    expect(res.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it.each([
    [{ posts: [newer,older], order: 'oldest' }, 503],
    [{ posts: [older,newer] }, 503],
    [{ posts: [older,newer], order: 'newest' }, 503],
    [{ posts: [older,newer], order: 'oldest' }, 200],
  ])('fails closed on unproved/unsorted HTTP 200', async (payload, expected) => {
    setup(payload);
    const res = await GET(req('order=oldest'),ctx);
    expect(res.status).toBe(expected);
    expect(res.headers.get('cache-control')).toContain('no-store');
  });
});
