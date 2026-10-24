import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android VIP chest fail-closed contract', () => {
  it('preserves private status and explicit unavailable state from the authenticated backend', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ available: false, isPlusUser: null, claimedToday: null }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/engagement/dopamine/vip-chest/status'), {
      params: Promise.resolve({ path: ['engagement', 'dopamine', 'vip-chest', 'status'] }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toMatchObject({ available: false, isPlusUser: null });
  });

  it('does not translate a denied award into Android success', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ statusCode: 503, message: 'VIP reward is unavailable' }), {
      status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
    })));
    const response = await POST(new NextRequest('https://easy-scraping.com/app-api/v1/engagement/dopamine/vip-chest', { method: 'POST' }), {
      params: Promise.resolve({ path: ['engagement', 'dopamine', 'vip-chest'] }),
    });
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toMatchObject({ statusCode: 503 });
  });
});
