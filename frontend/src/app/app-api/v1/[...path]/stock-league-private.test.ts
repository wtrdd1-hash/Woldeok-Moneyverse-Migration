import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android stock league optional-owner source privacy', () => {
  it('overrides a public upstream cache on a member-bearing league response', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({
      success: true, season: null, leaderboard: [], whales: [], mySubscriptions: [{ whaleName: 'private' }],
    }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(
      new NextRequest('https://easy-scraping.com/app-api/v1/stocks/league/current', {
        headers: { cookie: 'moneyverse_session=owner-session' },
      }),
      { params: Promise.resolve({ path: ['stocks', 'league', 'current'] }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    const [, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner-session');
  });
  it('rejects a malformed successful league envelope before Android renders it', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: true, season: {}, leaderboard: [] }), {
      headers: { 'content-type': 'application/json' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/stocks/league/current'), {
      params: Promise.resolve({ path: ['stocks', 'league', 'current'] }),
    });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('keeps failed league source responses private', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'unavailable' }), {
      status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/stocks/league/current'), {
      params: Promise.resolve({ path: ['stocks', 'league', 'current'] }),
    });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});
