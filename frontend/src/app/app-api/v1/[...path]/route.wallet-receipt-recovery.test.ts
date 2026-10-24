import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const ID = '22222222-2222-4222-8222-222222222222';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android historical wallet receipt privacy', () => {
  it('proxies authenticated owner receipts and overrides public upstream caching', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const fetchSpy = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(JSON.stringify({ transactionId: ID, netAmount: '0' }), {
        status: 200,
        headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', etag: '"private"' },
      }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/wallet/activity/' + ID, {
      headers: { cookie: 'session=owner' },
    }), { params: Promise.resolve({ path: ['wallet', 'activity', ID] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('etag')).toBeNull();
    expect(String(fetchSpy.mock.calls[0]![0])).toContain('/api/v1/wallet/activity/' + ID);
    expect(new Headers(fetchSpy.mock.calls[0]![1]?.headers).get('cookie')).toBe('session=owner');
    expect(await response.json()).toMatchObject({ transactionId: ID, netAmount: '0' });
  });
});
