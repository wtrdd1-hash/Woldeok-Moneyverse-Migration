import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { APP_API_CONTRACT_VERSION } from '@/lib/app-gateway';

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`https://easy-scraping.com${path}`, {
    headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', ...headers },
  });
}

function context(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

beforeEach(() => {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('app API route compatibility', () => {
  it('serves machine-readable contract metadata without touching the private API', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('/app-api/v1/meta/contract'), context('meta', 'contract'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-moneyverse-api-version')).toBe('1');
    expect(response.headers.get('x-moneyverse-contract-version')).toBe(APP_API_CONTRACT_VERSION);
    const body = await response.json();
    expect(body.baseUrl).toBe('https://easy-scraping.com/app-api/v1');
    expect(body.auth.persistentCookieJarRequired).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('returns a stable problem document for paths outside the app allow-list', async () => {
    const response = await GET(request('/app-api/v1/integrations/discord'), context('integrations', 'discord'));
    expect(response.status).toBe(404);
    expect(response.headers.get('content-type')).toContain('application/problem+json');
    expect(await response.json()).toMatchObject({ status: 404, code: 'app_gateway_path' });
  });

  it('forwards cache/range/client language request headers and compatibility response headers', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    let forwarded = new Headers();
    const fetchSpy = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      forwarded = new Headers(init?.headers);
      return new Response('bytes', {
        status: 206,
        headers: {
          'content-type': 'image/png',
          'content-range': 'bytes 0-4/5',
          'accept-ranges': 'bytes',
          etag: '"def"',
          'retry-after': '3',
        },
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    const response = await GET(
      request('/app-api/v1/media/picture.png', {
        'accept-language': 'ko-KR,ko;q=0.9,en;q=0.8',
        range: 'bytes=0-1023',
        'if-none-match': '"abc"',
      }),
      context('media', 'picture.png'),
    );

    expect(forwarded.get('accept-language')).toBe('ko-KR,ko;q=0.9,en;q=0.8');
    expect(forwarded.get('if-none-match')).toBe('"abc"');
    expect(forwarded.get('x-internal-token')).toHaveLength(32);
    expect(response.status).toBe(206);
    expect(response.headers.get('content-range')).toBe('bytes 0-4/5');
    expect(response.headers.get('accept-ranges')).toBe('bytes');
    expect(response.headers.get('etag')).toBe('"def"');
    expect(response.headers.get('retry-after')).toBe('3');
    expect(response.headers.get('x-moneyverse-contract-version')).toBe(APP_API_CONTRACT_VERSION);
  });

  it('turns upstream transport failures into stable JSON gateway errors', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('network down'); }));
    const response = await GET(request('/app-api/v1/stocks'), context('stocks'));
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      status: 502,
      code: 'app_gateway_unavailable',
    });
  });

  it('adds camelCase aliases to every JSON response while preserving legacy keys', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({
      daily_bet_limit: '5000',
      rows: [{ joined_at: '2026-09-14T00:00:00.000Z' }],
    }), { status: 200, headers: { 'content-type': 'application/json' } })));

    const response = await GET(request('/app-api/v1/casino/self-limit'), context('casino', 'self-limit'));
    expect(response.status).toBe(200);
    expect(response.headers.get('x-moneyverse-field-naming')).toBe('camelCase+legacy');
    expect(await response.json()).toEqual({
      daily_bet_limit: '5000',
      dailyBetLimit: '5000',
      rows: [{ joined_at: '2026-09-14T00:00:00.000Z', joinedAt: '2026-09-14T00:00:00.000Z' }],
    });
  });

  it('does not transform binary media bodies', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { 'content-type': 'image/png' },
    })));
    const response = await GET(request('/app-api/v1/media/picture.png'), context('media', 'picture.png'));
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2, 3]);
  });

  it('does not reflect a spoofed forwarded host into contract metadata', async () => {
    const response = await GET(
      request('/app-api/v1/meta/contract', { 'x-forwarded-host': 'attacker.example', 'x-forwarded-proto': 'http' }),
      context('meta', 'contract'),
    );
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.baseUrl).toBe('https://easy-scraping.com/app-api/v1');
    expect(JSON.stringify(body)).not.toContain('attacker.example');
  });

});
