import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';

const context = { params: Promise.resolve({ path: ['engagement', 'dopamine', 'mini-showdown'] }) };

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Android app-api practice showdown parity', () => {
  it('forwards authenticated session and CSRF, no client dice, and private response', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    let target = '';
    let forwarded = new Headers();
    let payload = '';
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      target = String(input);
      forwarded = new Headers(init?.headers);
      payload = new TextDecoder().decode(init?.body as ArrayBuffer);
      return new Response(JSON.stringify({ success: true, mode: 'PRACTICE_ONLY', stake: '0', payout: '0', playerRoll: [6], aiRoll: [1], outcome: 'win' }), {
        status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
      });
    }));
    const req = new NextRequest('https://easy-scraping.com/app-api/v1/engagement/dopamine/mini-showdown', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: 'sid=member', 'x-csrf-token': 'session-token' }, body: '{}',
    });
    const response = await POST(req, context);
    expect(target).toContain('/api/v1/engagement/dopamine/mini-showdown');
    expect(forwarded.get('cookie')).toBe('sid=member');
    expect(forwarded.get('x-csrf-token')).toBe('session-token');
    expect(payload).toBe('{}');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toMatchObject({ mode: 'PRACTICE_ONLY', payout: '0' });
  });
});
