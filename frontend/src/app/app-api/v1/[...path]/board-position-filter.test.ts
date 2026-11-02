import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

const url = 'https://easy-scraping.com/app-api/v1/board/public/stock-posts?position=holder';
const context = { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) };

async function run(payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  const upstream = vi.fn(async () => new Response(JSON.stringify(payload), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
  vi.stubGlobal('fetch', upstream);
  const response = await GET(new NextRequest(url, { headers: { host: 'easy-scraping.com' } }), context);
  return { response, upstream };
}

describe('Android board position disclosure source proof', () => {
  it('accepts a source-confirmed empty list with no-store and noindex', async () => {
    const { response, upstream } = await run({ posts: [], appliedPosition: 'holder' });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('position')).toBe('holder');
  });
  it('accepts one source-verified self-declared holding without treating it as verified account holdings', async () => {
    const { response } = await run({
      posts: [{ postId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', stock: { positionDisclosure: 'holder' } }],
      appliedPosition: 'holder',
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it.each([
    { posts: [] },
    { posts: [], appliedPosition: 'undisclosed' },
    { posts: [{ postId: 'a', stock: { positionDisclosure: 'undisclosed' } }], appliedPosition: 'holder' },
    { posts: [{ postId: 'a', stock: null }], appliedPosition: 'holder' },
  ])('fails closed on unverified upstream results %j', async (payload) => {
    const { response } = await run(payload);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
