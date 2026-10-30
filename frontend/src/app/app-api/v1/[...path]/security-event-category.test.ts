import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android owner security event category', () => {
  it('forwards a selected category with the owner session and forces private/noindex even on an upstream error', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(
      async () =>
        new Response(JSON.stringify({ error: 'invalid category' }), {
          status: 400,
          headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
        }),
    );
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/account/security/events?category=login',
      { headers: { cookie: 'moneyverse_session=owner-session' } },
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['account', 'security', 'events'] }),
    });
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [target, init] = upstream.mock.calls[0]!;
    expect(new URL(String(target)).searchParams.get('category')).toBe('login');
    expect(new Headers(init?.headers).get('cookie')).toContain('owner-session');
  });
  it('rejects malformed or category-mismatched successful upstream evidence instead of a false empty or wrong type', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            events: [{ type: 'local_password_changed', createdAt: '2026-10-30T03:00:00.000Z' }],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/account/security/events?category=login',
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['account', 'security', 'events'] }),
    });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(JSON.stringify(await response.json())).not.toContain('local_password_changed');
    upstream.mockImplementationOnce(
      async () =>
        new Response(JSON.stringify({ events: 'not-an-array' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    );
    const malformed = await GET(request, {
      params: Promise.resolve({ path: ['account', 'security', 'events'] }),
    });
    expect(malformed.status).toBe(503);
  });
  it('rejects duplicate category values before proxying an ambiguous Android request', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/account/security/events?category=login&category=settings',
    );
    const response = await GET(request, {
      params: Promise.resolve({ path: ['account', 'security', 'events'] }),
    });
    expect(response.status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it('rejects successful non-JSON and broken-JSON security evidence', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(
      async () =>
        new Response('not json', { status: 200, headers: { 'content-type': 'text/plain' } }),
    );
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/account/security/events?category=login',
    );
    const context = { params: Promise.resolve({ path: ['account', 'security', 'events'] }) };
    expect((await GET(request, context)).status).toBe(503);
    upstream.mockImplementationOnce(
      async () =>
        new Response('{bad', { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    expect((await GET(request, context)).status).toBe(503);
  });
});
