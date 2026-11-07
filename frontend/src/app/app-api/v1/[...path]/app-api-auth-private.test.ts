import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

function request(...path: string[]) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/${path.join('/')}`, {
    headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
  });
}

function context(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

beforeEach(() => {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('private app-api auth and owner data response boundaries', () => {
  it.each([200, 401, 403, 503])('never exposes shop holdings response %s to public caches or crawlers', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ holdings: [] }), {
      status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request('shop', 'holdings'), context('shop', 'holdings'));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });

  it.each([200, 401, 503])('never exposes auth session response %s to public caches or crawlers', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ authenticated: status === 200 }), {
      status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request('auth', 'session'), context('auth', 'session'));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });

  it('never caches or indexes a 403 even when a public help upstream incorrectly marks it cacheable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request('help', 'categories'), context('help', 'categories'));
    expect(response.status).toBe(403);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });

  it.each([401, 403])('fences auth error %s even on an otherwise public board path', async (status) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'denied' }), {
      status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request('board', 'public', 'stock-posts'), context('board', 'public', 'stock-posts'));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });

  it('keeps public contract metadata cacheable when there is no authentication failure', async () => {
    const response = await GET(request('meta', 'contract'), context('meta', 'contract'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=300');
  });
});
