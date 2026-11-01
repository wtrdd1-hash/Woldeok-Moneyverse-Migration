import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };
function req(query: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts${query}`, { headers: { host: 'easy-scraping.com' } });
}

describe('Android public board day parity', () => {
  it.each(['?day=2026-02-30', '?day=2026-11-01&day=2026-11-02', '?day=2026-11-01&unexpected=1'])('rejects invalid query %s before upstream access', async query => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    expect((await GET(req(query), context)).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it('rejects stale 200 response with wrong day and does not expose cacheable data', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ appliedDay: '2026-11-01', posts: [{ postId: '11111111-1111-4111-8111-111111111111', createdAt: '2026-10-31T14:59:59Z' }] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } })));
    const response = await GET(req('?day=2026-11-01'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('forwards a valid day, accepts matching rows and marks filtered response nonindexable', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ appliedDay: '2026-11-01', posts: [{ postId: '11111111-1111-4111-8111-111111111111', createdAt: '2026-10-31T15:00:00Z' }] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(req('?day=2026-11-01'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('day')).toBe('2026-11-01');
  });
});
