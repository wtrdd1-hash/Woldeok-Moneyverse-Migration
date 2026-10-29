import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const url = (suffix: string, method = 'GET') => new NextRequest('https://easy-scraping.com/app-api/v1/engagement/dopamine/vip-chest' + suffix, {
  method, headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android VIP chest app-api receipt boundary', () => {
  it('preserves explicit backend hold state and never caches private entitlement GET', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ available: false, isPlusUser: null, claimedToday: null, rewardAmount: '0', diceAwarded: 0, nextAvailableAt: null, reason: 'unverified_entitlement_and_ledger_receipt' }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(url('/status'), ctx('engagement', 'dopamine', 'vip-chest', 'status'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(await response.json()).toMatchObject({ available: false, isPlusUser: null });
  });
  it('passes backend 503 through without caching or inventing a mobile success receipt', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ statusCode: 503, message: 'unavailable' }), {
      status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await POST(url('', 'POST'), ctx('engagement', 'dopamine', 'vip-chest'));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(await response.json()).not.toHaveProperty('success', true);
  });
  it('rejects an outdated upstream that still fabricates a Plus reward on GET', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ isPlusUser: true, claimedToday: false, rewardAmount: 2000 }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })));
    const response = await GET(url('/status'), ctx('engagement', 'dopamine', 'vip-chest', 'status'));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).not.toHaveProperty('isPlusUser', true);
  });

  it('never relays a fabricated successful POST receipt from an outdated upstream', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ success: true, rewardAmount: 2000 }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })));
    const response = await POST(url('', 'POST'), ctx('engagement', 'dopamine', 'vip-chest'));
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty('success', true);
  });
});
