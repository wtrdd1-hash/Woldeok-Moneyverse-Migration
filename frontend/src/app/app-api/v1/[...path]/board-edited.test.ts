import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

const PATH = ['board', 'public', 'stock-posts'];
const POST = {
  postId: '11111111-2222-4333-8444-555555555555',
  title: 'Updated', authorName: 'Visitor',
  createdAt: '2026-10-30T01:00:00.000Z',
  updatedAt: '2026-10-31T01:00:00.000Z',
  commentCount: 0, mine: false, hasImage: false, stock: null,
};

function request(query: string, method: 'GET' | 'HEAD' = 'GET') {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts${query}`, {
    method, headers: { host: 'easy-scraping.com' },
  });
}
function upstream(posts: unknown) {
  return vi.fn(async () => new Response(JSON.stringify({ posts }), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
  }));
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android edited public board filter', () => {
  it('returns only source-verifiable edited posts, preserving query and privacy', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetch = upstream([POST]); vi.stubGlobal('fetch', fetch);
    const response = await GET(request('?editedOnly=1&q=Updated'), { params: Promise.resolve({ path: PATH }) });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ posts: [POST] });
    expect(new URL(String(fetch.mock.calls[0]?.[0])).searchParams.get('editedOnly')).toBe('1');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it.each(['?editedOnly=0', '?editedOnly=true', '?editedOnly=1&editedOnly=1', '?editedOnly=', '?editedOnly=1&extra=1'])('rejects invalid flag %s before upstream', async (query) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetch = upstream([]); vi.stubGlobal('fetch', fetch);
    const response = await GET(request(query), { params: Promise.resolve({ path: PATH }) });
    expect(response.status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it.each([
    [POST, POST],
    [{ ...POST, updatedAt: null }],
    [{ ...POST, updatedAt: '2026-10-29T01:00:00.000Z' }],
    [{ ...POST, postId: 'bad-id' }],
    [{ ...POST, createdAt: 'invalid' }],
  ])('fails closed when a 200 response cannot prove edited rows %#', async (...posts) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', upstream(posts));
    const response = await GET(request('?editedOnly=1'), { params: Promise.resolve({ path: PATH }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });
  it('fails closed on non-JSON 200 responses', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('ok', {
      status: 200, headers: { 'content-type': 'text/plain' },
    })));
    const response = await GET(request('?editedOnly=1'), { params: Promise.resolve({ path: PATH }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });
  it('does not cache upstream failure responses', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'unavailable' }), {
      status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const response = await GET(request('?editedOnly=1'), { params: Promise.resolve({ path: PATH }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });
  it('protects filtered HEAD responses as well', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 200, headers: { 'cache-control': 'public' } })));
    const response = await HEAD(request('?editedOnly=1', 'HEAD'), { params: Promise.resolve({ path: PATH }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });
});
