import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
import { appGatewayPath } from '@/lib/app-gateway';

const row = { slug: '2026-10-28-cn-coding-5', country: 'CN', topic: 'CODING', status: 'PUBLISHED',
  receipt: '12345678-1234-4123-a123-123456789012' };
const context = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const request = (query = '') => new NextRequest('https://easy-scraping.com/app-api/v1/blog/verified' + query);

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android verified public editorial topic discovery', () => {
  it('allowlists public verified routes, not editorial administration', () => {
    expect(appGatewayPath(['blog', 'verified'])).toBe('/api/v1/blog/verified');
    expect(appGatewayPath(['blog', 'verified', row.slug])).toBe('/api/v1/blog/verified/' + row.slug);
    expect(appGatewayPath(['blog', 'admin', 'publish'])).toBeNull();
    expect(appGatewayPath(['blog', 'verified', '../admin'])).toBeNull();
  });

  it('forwards a single topic and prevents caching and indexing query results', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({
      success: true, count: 1, scope: 'LATEST_150_PUBLISHED', posts: [row],
    }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('?topic=CODING'), context('blog', 'verified'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('topic')).toBe('CODING');
    expect((await response.json()).posts).toEqual([row]);
  });

  it.each(['?topic=CODING&topic=COMPUTER', '?topic=', '?topic=coding', '?topic=ECONOMY&admin=1'])('rejects malformed or duplicated topic query: %s', async (query) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request(query), context('blog', 'verified'));
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    { success: true, count: 1, scope: 'LATEST_150_PUBLISHED', posts: [{ ...row, topic: 'ECONOMY' }] },
    { success: true, count: 1, scope: 'LATEST_150_PUBLISHED', posts: [{ ...row, status: 'WITHDRAWN' }] },
    { success: true, count: 1, posts: [row] },
    { success: true, count: 0, scope: 'LATEST_150_PUBLISHED', posts: 'invalid' },
  ])('fails closed when a 200 response cannot prove filtered publication', async (body) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), {
      status: 200, headers: { 'content-type': 'application/json' },
    })));
    const response = await GET(request('?topic=CODING'), context('blog', 'verified'));
    expect(response.status).toBe(503);
  });

  it('rejects write methods to public blog paths', async () => {
    const response = await POST(new NextRequest(request().url, { method: 'POST' }), context('blog', 'verified'));
    expect(response.status).toBe(405);
  });
});
