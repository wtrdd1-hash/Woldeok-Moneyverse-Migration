import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import { bankStandingFixture } from '@/app/bank/bank-standing-proof.test';

const url = 'https://easy-scraping.com/app-api/v1/banking/standing';
const context = { params: Promise.resolve({ path: ['banking', 'standing'] }) };

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android bank standing source and owner privacy', () => {
  it.each([
    ['valid', bankStandingFixture, 200],
    ['invalid WLD', { ...bankStandingFixture, cash_balance: 'forged' }, 503],
    ['invalid bonds', { ...bankStandingFixture, bonds: [{ ...bankStandingFixture.bonds[0], principal_amount: 'x' }] }, 503],
  ])('%s is source-verified, never public cached or indexed', async (_name, payload, expected) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600', 'x-robots-tag': 'index, follow' },
    })));
    const response = await GET(new NextRequest(url), context);
    expect(response.status).toBe(expected);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    const body = await response.text();
    if (expected === 503) expect(body).not.toContain('900719925474099312345678901');
  });

  it('does not expose upstream SQL errors or turn a failed read into zero balances', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('permission denied for private table', {
      status: 500, headers: { 'content-type': 'text/plain', 'cache-control': 'public' },
    })));
    const response = await GET(new NextRequest(url), context);
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private table');
  });
});
