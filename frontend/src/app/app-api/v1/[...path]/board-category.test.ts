import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
const request = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts?${query}`, { headers: { host: 'easy-scraping.com' } });

describe('Android board category source proof', () => {
  it.each(['category=unknown', 'category=question&category=analysis', 'category='])('rejects invalid category %s before upstream fetch', async (query) => {
    vi.stubGlobal('fetch', vi.fn());
    const response = await GET(request(query), context);
    expect(response.status).toBe(400);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
  it.each([
    [{ posts: [] }, 503],
    [{ posts: [], categoryFilter: 'question' }, 200],
    [{ posts: [{ postId: '11111111-1111-4111-8111-111111111111', stock: { category: 'analysis' } }], categoryFilter: 'question' }, 503],
    [{ posts: [{ postId: '11111111-1111-4111-8111-111111111111', stock: { category: 'question' } }, { postId: '11111111-1111-4111-8111-111111111111'.toUpperCase(), stock: { category: 'question' } }], categoryFilter: 'question' }, 503],
  ])('checks exact category evidence on upstream success', async (payload, expectedStatus) => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('category=question'), context);
    expect(response.status).toBe(expectedStatus);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('category')).toBe('question');
  });
});
