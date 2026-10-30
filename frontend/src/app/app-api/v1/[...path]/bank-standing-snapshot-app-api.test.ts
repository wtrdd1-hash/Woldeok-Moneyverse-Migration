import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const snapshot = {
  currency: 'WLD', cashBalance: '900719925474099312345678', depositBalance: '12',
  unclaimedInterest: '0', activeLoanOutstanding: null,
  observedAt: '2026-10-30T12:34:56.789Z', readOnly: true,
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android authenticated bank snapshot proof', () => {
  it.each([
    ['verified', snapshot, 'application/json', 200],
    ['forged amount', { ...snapshot, cashBalance: '=HYPERLINK(1)' }, 'application/json', 503],
    ['wrong metadata', { ...snapshot, readOnly: false }, 'application/json', 503],
    ['missing loan status', { ...snapshot, activeLoanOutstanding: undefined }, 'application/json', 503],
    ['non-JSON', snapshot, 'text/plain', 503],
  ])('%s: rejects unverified HTTP 200 and always protects owner data', async (_label, payload, contentType, expected) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const upstream = vi.fn(async () => new Response(JSON.stringify(payload), {
      status: 200, headers: { 'content-type': contentType, 'cache-control': 'public, max-age=3600' },
    }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/banking/standing/snapshot'), {
      params: Promise.resolve({ path: ['banking', 'standing', 'snapshot'] }),
    });
    expect(response.status).toBe(expected);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    if (expected === 503) expect(await response.text()).not.toContain('900719925474099312345678');
    expect(upstream).toHaveBeenCalledOnce();
  });

  it('does not forward untrusted upstream failure details', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('sensitive internal DB error', {
      status: 503, headers: { 'content-type': 'text/plain', 'cache-control': 'public' },
    })));
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/banking/standing/snapshot'), {
      params: Promise.resolve({ path: ['banking', 'standing', 'snapshot'] }),
    });
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('sensitive internal DB error');
  });
});
