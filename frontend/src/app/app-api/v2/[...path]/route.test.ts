import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

function request(path: string, init: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
  return new NextRequest(`https://easy-scraping.com${path}`, {
    method: init.method ?? 'GET',
    headers: {
      host: 'easy-scraping.com',
      'x-forwarded-proto': 'https',
      'x-moneyverse-app-version': '2.4.1',
      ...init.headers,
    },
    ...(init.body === undefined ? {} : { body: init.body }),
  });
}

function context(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

beforeEach(() => {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 's'.repeat(32));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('App Core v2 route', () => {
  it('publishes v2 contract metadata without contacting the private API', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('/app-api/v2/meta/contract'), context('meta', 'contract'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-moneyverse-api-version')).toBe('2');
    expect((await response.json()).baseUrl).toBe('https://easy-scraping.com/app-api/v2');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects an obsolete app version before proxying', async () => {
    vi.stubEnv('APP_API_MIN_VERSION', '2.4.0');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(
      request('/app-api/v2/stocks', { headers: { 'x-moneyverse-app-version': '2.3.9' } }),
      context('stocks'),
    );
    expect(response.status).toBe(426);
    expect(await response.json()).toMatchObject({ code: 'app_upgrade_required' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects a path that is not in the App manifest', async () => {
    const response = await GET(
      request('/app-api/v2/integrations/discord'),
      context('integrations', 'discord'),
    );
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ code: 'app_gateway_path' });
  });

  it('fails closed for an integrity-marked write when enforcement is enabled and evidence is absent', async () => {
    vi.stubEnv('APP_API_INTEGRITY_ENFORCEMENT', 'true');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await POST(
      request('/app-api/v2/wallet/transfers', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ recipientUserId: '00000000-0000-4000-8000-000000000001', amount: '1' }),
      }),
      context('wallet', 'transfers'),
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ code: 'app_integrity_required' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });


  it('does not treat an unverified raw integrity token as a verified verdict', async () => {
    vi.stubEnv('APP_API_INTEGRITY_ENFORCEMENT', 'true');
    const fetchSpy = vi.fn(async () =>
      new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }),
    );
    vi.stubGlobal('fetch', fetchSpy);
    const response = await POST(
      request('/app-api/v2/wallet/transfers', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-play-integrity-token': 'raw-unverified-token',
        },
        body: JSON.stringify({ recipientUserId: '00000000-0000-4000-8000-000000000001', amount: '1' }),
      }),
      context('wallet', 'transfers'),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'app_integrity_verifier_unavailable' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('preserves binary upstream response bytes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(new Uint8Array([9, 8, 7]), {
          status: 200,
          headers: { 'content-type': 'image/png' },
        }),
      ),
    );
    const response = await GET(request('/app-api/v2/content/photos'), context('content', 'photos'));
    expect(response.status).toBe(200);
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([9, 8, 7]);
  });
});
