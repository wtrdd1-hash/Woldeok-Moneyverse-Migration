import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

const HUGE = '90071992547409931234567890123456789012';
const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const walletRequest = (headers: Record<string, string> = {}) => new NextRequest(
  'https://easy-scraping.com/app-api/v1/wallet?recent=50',
  { headers: { host: 'easy-scraping.com', cookie: 'session=member-one', ...headers } },
);

beforeEach(() => {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('authenticated wallet mobile cache isolation', () => {
  it('forbids shared and browser caching, drops validators and keeps exact owner pocket strings', async () => {
    let outgoing = new Headers();
    vi.stubGlobal('fetch', vi.fn(async (_target: RequestInfo | URL, init?: RequestInit) => {
      outgoing = new Headers(init?.headers);
      return new Response(JSON.stringify({
        recent_transactions: [{ cash_delta: '-' + HUGE, bank_delta: HUGE, net_amount: '0' }],
      }), { status: 200, headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=3600',
        etag: '"wallet-member-one"',
        'last-modified': 'Wed, 21 Oct 2026 00:00:00 GMT',
      } });
    }));
    const response = await GET(walletRequest({ 'if-none-match': '"wallet-member-one"', 'if-modified-since': 'Wed, 21 Oct 2026 00:00:00 GMT' }), ctx('wallet'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('etag')).toBeNull();
    expect(response.headers.get('last-modified')).toBeNull();
    expect(outgoing.get('if-none-match')).toBeNull();
    expect(outgoing.get('if-modified-since')).toBeNull();
    expect(outgoing.get('cookie')).toBe('session=member-one');
    expect(JSON.stringify(await response.json())).toContain(HUGE);
    expect(response.headers.get('x-internal-token')).toBeNull();
  });

  it('applies no-store to wallet errors and HEAD, even if upstream returns cacheable metadata', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('error', {
      status: 503, headers: { 'cache-control': 'public, max-age=60', etag: '"error"' },
    })));
    const error = await GET(walletRequest(), ctx('wallet'));
    expect(error.headers.get('cache-control')).toBe('private, no-store');
    expect(error.headers.get('etag')).toBeNull();
    const head = await HEAD(walletRequest(), ctx('wallet'));
    expect(head.status).toBe(503);
    expect(head.headers.get('cache-control')).toBe('private, no-store');
    expect(head.headers.get('etag')).toBeNull();
  });

  it('does not cache a wallet version-policy rejection or a not-modified upstream reply', async () => {
    vi.stubEnv('APP_API_MIN_VERSION', '2.0.0');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const rejected = await GET(walletRequest(), ctx('wallet'));
    expect(rejected.status).toBe(426);
    expect(rejected.headers.get('cache-control')).toBe('private, no-store');
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.stubEnv('APP_API_MIN_VERSION', '');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status: 304, headers: { etag: '"prior-member"', 'cache-control': 'public, max-age=600' },
    })));
    const notModified = await GET(walletRequest(), ctx('wallet'));
    expect(notModified.status).toBe(304);
    expect(notModified.headers.get('cache-control')).toBe('private, no-store');
    expect(notModified.headers.get('etag')).toBeNull();
  });

  it('preserves explicit public caching and validators for unrelated media resources', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('bytes', {
      headers: { 'cache-control': 'public, max-age=300', etag: '"image"' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/media/photo.png'), ctx('media', 'photo.png'));
    expect(response.headers.get('cache-control')).toBe('public, max-age=300');
    expect(response.headers.get('etag')).toBe('"image"');
  });
});
