import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

async function call(topic: string, payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  const upstream = vi.fn(async () => new Response(JSON.stringify(payload), {
    status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' },
  }));
  vi.stubGlobal('fetch', upstream);
  const request = new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts?topic=' + topic, {
    headers: { host: 'easy-scraping.com' },
  });
  const response = await GET(request, { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) });
  return { response, upstream };
}

describe('Android public board topic scope proof', () => {
  it('forwards and verifies a stock-only empty snapshot without indexing', async () => {
    const { response, upstream } = await call('stock', { posts: [], appliedTopic: 'stock' });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('topic')).toBe('stock');
  });
  it('fails closed if a stale backend ignores the requested filter', async () => {
    const { response } = await call('stock', { posts: [] });
    expect(response.status).toBe(503);
  });
  it('rejects a mismatched classification even with a matching source echo', async () => {
    const { response } = await call('stock', {
      appliedTopic: 'stock', posts: [{
        postId: '11111111-2222-4333-8444-555555555555', stock: null,
      }],
    });
    expect(response.status).toBe(503);
  });
  it('rejects a duplicate post ID with different letter casing', async () => {
    const id = 'aaaaaaaa-2222-4333-8444-555555555555';
    const stock = { stockId: id, symbol: 'WDX' };
    const { response } = await call('stock', {
      appliedTopic: 'stock', posts: [{ postId: id, stock }, { postId: id.toUpperCase(), stock }],
    });
    expect(response.status).toBe(503);
  });
  it('rejects invalid topic before contacting the upstream API', async () => {
    const { response, upstream } = await call('wrong', { posts: [] });
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
});
