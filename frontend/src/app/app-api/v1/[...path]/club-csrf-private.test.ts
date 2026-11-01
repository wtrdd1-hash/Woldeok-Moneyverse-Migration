import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('club mutation gateway and session CSRF privacy', () => {
  it('keeps session CSRF private even when upstream advertises a public cache', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ csrfToken: 'a'.repeat(43) }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/auth/session', {
      headers: { cookie: 'moneyverse_session=owner' },
    }), { params: Promise.resolve({ path: ['auth', 'session'] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });

  it('forwards club write CSRF and preserves 503 hold with private headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const spy = vi.fn(async () => new Response(JSON.stringify({ message: 'ledger settlement unavailable' }), {
      status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    }));
    vi.stubGlobal('fetch', spy);
    const response = await POST(new NextRequest('https://easy-scraping.com/app-api/v1/clubs/abc/join', {
      method: 'POST', headers: { cookie: 'moneyverse_session=owner', 'x-csrf-token': 'a'.repeat(43) },
    }), { params: Promise.resolve({ path: ['clubs', 'abc', 'join'] }) });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [, init] = spy.mock.calls[0]!;
    expect(new Headers(init?.headers).get('x-csrf-token')).toBe('a'.repeat(43));
    expect(new Headers(init?.headers).get('cookie')).toContain('owner');
  });
});
