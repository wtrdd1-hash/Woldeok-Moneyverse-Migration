import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android bank owner response privacy', () => {
  for (const [path, status] of [
    ['bank/accounts', 200],
    ['banking/loans', 200],
    ['bank/accounts', 401],
    ['banking/loans', 503],
    ['bank/accounts', 204],
  ] as const) {
    it(`forces private headers on ${path} HTTP ${status}`, async () => {
      vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
      const upstream = vi.fn(async () => new Response(status === 204 ? null : JSON.stringify({ accounts: [] }), {
        status,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=86400',
          'x-robots-tag': 'index, follow',
          'referrer-policy': 'unsafe-url',
        },
      }));
      vi.stubGlobal('fetch', upstream);
      const request = new NextRequest(`https://easy-scraping.com/app-api/v1/${path}`, {
        headers: { cookie: 'moneyverse_session=owner-session' },
      });
      const response = await GET(request, { params: Promise.resolve({ path: path.split('/') }) });
      expect(response.status).toBe(status);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex');
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
      expect(upstream).toHaveBeenCalledTimes(1);
    });
  }

  it('keeps a public app API catalogue response outside the bank privacy override', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ stocks: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/stocks'), {
      params: Promise.resolve({ path: ['stocks'] }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=60');
    expect(response.headers.get('referrer-policy')).not.toBe('no-referrer');
  });

  it('applies owner headers on HEAD without forwarding a response body', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status: 200,
      headers: { 'cache-control': 'public', 'x-robots-tag': 'index, follow', 'referrer-policy': 'unsafe-url' },
    })));
    const response = await HEAD(new NextRequest('https://easy-scraping.com/app-api/v1/banking/loans', { method: 'HEAD' }), {
      params: Promise.resolve({ path: ['banking', 'loans'] }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(await response.text()).toBe('');
  });
});
