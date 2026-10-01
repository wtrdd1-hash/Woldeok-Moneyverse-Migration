import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

function request(path: string, init: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
  return new NextRequest(`https://easy-scraping.com${path}`, {
    method: init.method ?? 'GET',
    headers: {
      host: 'easy-scraping.com',
      'x-forwarded-proto': 'https',
      ...init.headers,
    },
    ...(init.body === undefined ? {} : { body: init.body }),
  });
}

function context(...path: string[]) {
  return { params: Promise.resolve({ path }) };
}

beforeEach(() => {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 's'.repeat(32));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('Site Core v1 route', () => {
  it('does not reflect a spoofed forwarded host in contract metadata', async () => {
    vi.stubGlobal('fetch', vi.fn());
    const response = await GET(
      request('/site-api/v1/meta/contract', {
        headers: { 'x-forwarded-host': 'attacker.example', 'x-forwarded-proto': 'http' },
      }),
      context('meta', 'contract'),
    );
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.baseUrl).toBe('https://easy-scraping.com/site-api/v1');
    expect(JSON.stringify(body)).not.toContain('attacker.example');
  });

  it('returns a stable 404 for an App-only route', async () => {
    const response = await GET(request('/site-api/v1/wallet'), context('wallet'));
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ code: 'site_gateway_path' });
  });

  it('does not let a Site route resolve an App/admin-only definition', async () => {
    const response = await GET(request('/site-api/v1/admin/me'), context('admin', 'me'));
    expect(response.status).toBe(404);
  });

  it('does not manufacture CSRF for a state-changing session route', async () => {
    let forwarded = new Headers();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        forwarded = new Headers(init?.headers);
        return new Response(
          JSON.stringify({ title: 'Forbidden', status: 403, code: 'csrf_required' }),
          { status: 403, headers: { 'content-type': 'application/problem+json' } },
        );
      }),
    );
    const response = await POST(
      request('/site-api/v1/support/threads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subject: 'x', body: 'y', idempotencyKey: crypto.randomUUID() }),
      }),
      context('support', 'threads'),
    );
    expect(forwarded.get('x-csrf-token')).toBeNull();
    expect(response.status).toBe(403);
  });

  it('strips a caller-spoofed internal token and uses only the server credential', async () => {
    let forwarded = new Headers();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        forwarded = new Headers(init?.headers);
        return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
      }),
    );
    const response = await GET(
      request('/site-api/v1/stocks', { headers: { 'x-internal-token': 'attacker' } }),
      context('stocks'),
    );
    expect(response.status).toBe(200);
    expect(forwarded.get('x-internal-token')).toBe('s'.repeat(32));
    expect(forwarded.get('x-moneyverse-gateway')).toBe('site-api-v1');
  });
});
