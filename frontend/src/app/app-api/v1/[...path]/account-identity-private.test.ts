import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { DELETE, GET, HEAD } from './route';

type Method = 'GET' | 'HEAD' | 'DELETE';

function request(path: string, method: Method): NextRequest {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/${path}`, {
    method,
    headers: {
      host: 'easy-scraping.com',
      cookie: 'moneyverse_session=owner-session',
      'x-csrf-token': 'owner-csrf',
    },
  });
}

function context(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

beforeEach(() => {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('owner account App API edge privacy', () => {
  it.each([
    { method: 'GET' as const, parts: ['account', 'identities'], status: 200 },
    { method: 'GET' as const, parts: ['account', 'identities'], status: 401 },
    { method: 'HEAD' as const, parts: ['account', 'identities'], status: 401 },
    { method: 'DELETE' as const, parts: ['account', 'identities', '00000000-0000-4000-8000-000000000001'], status: 204 },
    { method: 'DELETE' as const, parts: ['account'], status: 503 },
  ])('protects $method $parts with upstream HTTP $status', async ({ method, parts, status }) => {
    const upstream = vi.fn(async () => new Response(
      status === 204 ? null : JSON.stringify({ identities: [{ provider: 'discord', id: 'owner-only' }] }),
      { status, headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=86400',
        'etag': '"owner-secret"',
      } },
    ));
    vi.stubGlobal('fetch', upstream);
    const handler = method === 'GET' ? GET : method === 'HEAD' ? HEAD : DELETE;
    const response = await handler(request(parts.join('/'), method), context(...parts));
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(upstream).toHaveBeenCalledTimes(1);
    const [target, init] = upstream.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).pathname).toBe(`/api/v1/${parts.join('/')}`);
    expect(new Headers(init.headers).get('cookie')).toContain('owner-session');
  });

  it('does not turn the public contract metadata into a private owner response', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('meta/contract', 'GET'), context('meta', 'contract'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=300');
    expect(upstream).not.toHaveBeenCalled();
  });
});
