import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const buff = {
  id: '11111111-1111-4111-8111-111111111111', buffKey: 'WORK_SALARY_BOOST_150',
  title: 'Verified work buff', description: 'From backend', targetDomain: 'work',
  multiplier: 1.5, active: true, startsAt: '2026-10-27T01:00:00.000Z',
  endsAt: '2099-10-27T01:00:00.000Z',
};
const request = () => new NextRequest('https://easy-scraping.com/app-api/v1/economy/hot-time/active');
const params = { params: Promise.resolve({ path: ['economy', 'hot-time', 'active'] }) };
const upstream = (body: unknown, status = 200, contentType = 'application/json') => new Response(
  JSON.stringify(body), { status, headers: { 'content-type': contentType, 'cache-control': 'public, max-age=86400' } },
);

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android hot-time live source parity', () => {
  it('refuses a stale success-shaped backend snapshot rather than forwarding LIVE to Android', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upstream({ activeBuffs: [buff], hasActiveHotTime: true, serverTime: '2026-10-27T04:00:00.000Z' })));
    const response = await GET(request(), params);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(JSON.stringify(await response.json())).not.toContain('Verified work buff');
  });

  it('passes a fresh verified source without inheriting a public upstream cache', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(upstream({ activeBuffs: [buff], hasActiveHotTime: true, serverTime: new Date().toISOString() })));
    const response = await GET(request(), params);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect((await response.json()).activeBuffs).toHaveLength(1);
  });

  it('returns a sanitized 503 on source failure or non-JSON success', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    for (const response of [upstream({ detail: 'private SQL table name' }, 503), upstream('<html>fake</html>', 200, 'text/html')]) {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
      const result = await GET(request(), params);
      expect(result.status).toBe(503);
      expect(JSON.stringify(await result.json())).not.toContain('private SQL table name');
      expect(result.headers.get('cache-control')).toBe('private, no-store');
    }
  });
});
