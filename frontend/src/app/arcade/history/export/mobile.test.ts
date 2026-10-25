import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/app-api/v1/[...path]/route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android member casino history range', () => {
  it('forwards owner session and 100-play limit while preserving private response', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('API_ORIGIN', 'http://127.0.0.1:3020');
    let target = '';
    let cookie = '';
    vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      target = String(input);
      cookie = new Headers(init?.headers).get('cookie') ?? '';
      return new Response(JSON.stringify([{ stake_amount: '9007199254740993' }]), {
        status: 200,
        headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' },
      });
    }));
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/casino/history?limit=100', {
      headers: {
        host: 'easy-scraping.com',
        'x-forwarded-proto': 'https',
        cookie: 'session=member-session',
      },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['casino', 'history'] }) });
    expect(response.status).toBe(200);
    expect(target).toContain('/api/v1/casino/history?limit=100');
    expect(cookie).toContain('session=member-session');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toEqual([{ stake_amount: '9007199254740993', stakeAmount: '9007199254740993' }]);
  });
});
