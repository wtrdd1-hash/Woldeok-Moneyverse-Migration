import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android public board identity proof', () => {
  it('rejects a malformed JSON 200 instead of forwarding unverifiable bytes', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{broken', {
      status: 200, headers: { 'content-type': 'application/json' },
    })));
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts', {
      headers: { host: 'easy-scraping.com' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) });
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('public_board_identity_unverified');
  });

  it('rejects a successful non-JSON response rather than trusting the content type', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not json', {
      status: 200, headers: { 'content-type': 'text/plain' },
    })));
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts', {
      headers: { host: 'easy-scraping.com' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) });
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('public_board_identity_unverified');
  });

  it('rejects a successful but unverified upstream list instead of returning broken links', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts: [{ postId: 'bad-id' }] }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })));
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/board/public/stock-posts', {
      headers: { host: 'easy-scraping.com' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['board', 'public', 'stock-posts'] }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).code).toBe('public_board_identity_unverified');
  });
});
