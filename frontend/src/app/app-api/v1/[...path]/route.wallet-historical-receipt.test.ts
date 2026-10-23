import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const TRANSACTION = '22222222-2222-4222-8222-222222222222';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android owner historical receipt', () => {
  it('forwards the authenticated session to the owner-scoped receipt API without public caching', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const fetchSpy = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ transactionId: TRANSACTION, netWalletDelta: '0' }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest(`https://easy-scraping.com/app-api/v1/wallet/activity/${TRANSACTION}`, {
      headers: { cookie: 'session=private-session', host: 'easy-scraping.com' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['wallet', 'activity', TRANSACTION] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(String(fetchSpy.mock.calls[0]![0])).toContain(`/api/v1/wallet/activity/${TRANSACTION}`);
    expect(new Headers(fetchSpy.mock.calls[0]![1]?.headers).get('cookie')).toBe('session=private-session');
    expect(await response.json()).toMatchObject({ transactionId: TRANSACTION, netWalletDelta: '0' });
  });
});

describe('wallet gateway cache boundary', () => {
  it('overrides a mistakenly public upstream receipt cache policy and strips validators', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{"state":"CONFIRMED"}', {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', etag: '"sensitive"' },
    })));
    const response = await GET(new NextRequest(`https://easy-scraping.com/app-api/v1/wallet/activity/${TRANSACTION}`), {
      params: Promise.resolve({ path: ['wallet', 'activity', TRANSACTION] }),
    });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('etag')).toBeNull();
  });
});
