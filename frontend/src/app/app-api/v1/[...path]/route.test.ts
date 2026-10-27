import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';
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

  it.each([200, 401, 403, 500])('fences privacy request GET response %s regardless of upstream cache policy', async (status) => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ requests: [{ detail: 'private detail' }] }), {
      status,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request('/app-api/v1/privacy/requests'), context('privacy', 'requests'));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });

  it('fences privacy request POST receipt even when upstream marks it public', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ requestId: 'private-receipt' }), {
      status: 201, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const response = await POST(new NextRequest('https://easy-scraping.com/app-api/v1/privacy/requests', {
      method: 'POST', headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
      body: JSON.stringify({ requestType: 'access' }),
    }), context('privacy', 'requests'));
    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });

  it('never caches privacy gateway failures or app-version refusals', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('upstream unavailable'); }));
    const failure = await GET(request('/app-api/v1/privacy/requests'), context('privacy', 'requests'));
    expect(failure.status).toBe(502);
    expect(failure.headers.get('cache-control')).toBe('private, no-store');
    vi.stubEnv('APP_API_MIN_VERSION', '3.0.0');
    const refused = await GET(request('/app-api/v1/privacy/requests', {
      'x-moneyverse-app-version': '2.0.0',
    }), context('privacy', 'requests'));
    expect(refused.status).toBe(426);
    expect(refused.headers.get('cache-control')).toBe('private, no-store');
  });

  it('preserves bounded wallet activity period queries through the Android app API', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    const fetchSpy = vi.fn(async (_input: RequestInfo | URL) => new Response(JSON.stringify({ recentTransactions: [], recentTransactionsHasMore: true }), {
      status: 200, headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('/app-api/v1/wallet?recent=50&period=7d'), context('wallet'));
    expect(response.status).toBe(200);
    const target = new URL(String(fetchSpy.mock.calls[0]?.[0]));
    expect(target.pathname).toBe('/api/v1/wallet');
    expect(target.searchParams.get('recent')).toBe('50');
    expect(target.searchParams.get('period')).toBe('7d');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect((await response.json()).recentTransactionsHasMore).toBe(true);
  });

  it('rejects obsolete app versions with a stable 426 contract before proxying', async () => {
    vi.stubEnv('APP_API_MIN_VERSION', '2.4.0');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(
      request('/app-api/v1/stocks', { 'x-moneyverse-app-version': '2.3.9' }),
      context('stocks'),
    );
    expect(response.status).toBe(426);
    expect(response.headers.get('x-moneyverse-min-app-version')).toBe('2.4.0');
    expect(await response.json()).toMatchObject({ status: 426, code: 'app_upgrade_required' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fails closed when the configured minimum app version is invalid', async () => {
    vi.stubEnv('APP_API_MIN_VERSION', 'latest');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(
      request('/app-api/v1/stocks', { 'x-moneyverse-app-version': '9.9.9' }),
      context('stocks'),
    );
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ status: 503, code: 'app_gateway_version_policy_invalid' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('allows a supported app version to reach the private API', async () => {
    vi.stubEnv('APP_API_MIN_VERSION', '2.4.0');
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    const fetchSpy = vi.fn(async () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(
      request('/app-api/v1/stocks', { 'x-moneyverse-app-version': '2.4.1' }),
      context('stocks'),
    );
    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
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


describe('Android owner-scoped banking cache privacy', () => {
  it.each([
    ['loan history', ['bank', 'loans']],
    ['banking standing', ['banking', 'standing']],
    ['repayment preview', ['banking', 'repay-preview']],
  ])('never forwards public cache policy for %s', async (_label, parts) => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ loans: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const response = await GET(request(`/app-api/v1/${parts.join('/')}`), context(...parts));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('never caches a bank loan gateway failure', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('unavailable'); }));
    const response = await GET(request('/app-api/v1/bank/loans'), context('bank', 'loans'));
    expect(response.status).toBe(502);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('never caches a bank loan app-version denial', async () => {
    vi.stubEnv('APP_API_MIN_VERSION', '9.0.0');
    const response = await GET(
      request('/app-api/v1/bank/loans', { 'x-moneyverse-app-version': '1.0.0' }),
      context('bank', 'loans'),
    );
    expect(response.status).toBe(426);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('keeps public contract metadata cacheable', async () => {
    const response = await GET(request('/app-api/v1/meta/contract'), context('meta', 'contract'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=300');
  });
});


describe('Android chat bigint cursor and private cache boundary', () => {
  it('forwards exact bigint sync cursors without converting them to JS numbers', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    const fetchSpy = vi.fn(async (_input: RequestInfo | URL) => new Response(JSON.stringify({ messages: [{ sequence: '9007199254740993' }] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const path = '/app-api/v1/chat/conversations/11111111-1111-4111-8111-111111111111/sync?sinceSequence=9007199254740993';
    const response = await GET(request(path), context('chat', 'conversations', '11111111-1111-4111-8111-111111111111', 'sync'));
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('sinceSequence')).toBe('9007199254740993');
    expect((await response.json()).messages[0].sequence).toBe('9007199254740993');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('does not cache private chat gateway failures or forward read receipts as rounded numbers', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    const fetchSpy = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      expect(JSON.parse(new TextDecoder().decode(init?.body as ArrayBuffer)).sequence).toBe('9007199254740993');
      return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
    });
    vi.stubGlobal('fetch', fetchSpy);
    const conversation = '11111111-1111-4111-8111-111111111111';
    const response = await POST(new NextRequest(`https://easy-scraping.com/app-api/v1/chat/conversations/${conversation}/read`, {
      method: 'POST', headers: { host: 'easy-scraping.com', 'content-type': 'application/json' },
      body: JSON.stringify({ sequence: '9007199254740993' }),
    }), context('chat', 'conversations', conversation, 'read'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline'); }));
    const failed = await GET(request(`/app-api/v1/chat/conversations/${conversation}/messages`),
      context('chat', 'conversations', conversation, 'messages'));
    expect(failed.status).toBe(502);
    expect(failed.headers.get('cache-control')).toBe('private, no-store');
  });
});
