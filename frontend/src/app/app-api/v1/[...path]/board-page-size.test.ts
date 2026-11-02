import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
const url = 'https://easy-scraping.com/app-api/v1/board/public/stock-posts';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android bounded public board display size', () => {
  it.each(['10', '25', '50'])('verifies size %s, forwards parameter and forces no-store/noindex', async (limit) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ posts: [], limitApplied: Number(limit), sourceWindow: 50 }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(new NextRequest(`${url}?limit=${limit}`, { headers: { host: 'easy-scraping.com' } }), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('limit')).toBe(limit);
  });
  it('fails closed when a legacy backend ignores the limit on empty results', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts: [] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(new NextRequest(`${url}?limit=10`, { headers: { host: 'easy-scraping.com' } }), context);
    expect(response.status).toBe(503);
  });
  it.each(['limit=0', 'limit=010', 'limit=10&limit=25'])('rejects invalid or repeated limit %s without upstream call', async (query) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    const response = await GET(new NextRequest(`${url}?${query}`, { headers: { host: 'easy-scraping.com' } }), context);
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
});
