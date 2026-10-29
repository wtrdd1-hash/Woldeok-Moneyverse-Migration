import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android member support summary', () => {
  it('forwards the owner session and overrides a cacheable upstream response', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({
      open: 2, waitingUser: 1, resolved: 0, scanned: 3, mayBeIncomplete: false,
    }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/support/threads/summary', {
      headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=owner' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['support', 'threads', 'summary'] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).pathname).toBe('/api/v1/support/threads/summary');
    expect(new Headers(fetchSpy.mock.calls[0]?.[1]?.headers).get('cookie')).toContain('moneyverse_session=owner');
  });
});

describe('Android support summary fail-closed contract', () => {
  it('rejects invented totals from an old backend', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      open: 3, waitingUser: 2, resolved: 1, scanned: 4, mayBeIncomplete: false,
    }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/support/threads/summary', {
      headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['support', 'threads', 'summary'] }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toMatchObject({ code: 'support_summary_unverified' });
  });
});
