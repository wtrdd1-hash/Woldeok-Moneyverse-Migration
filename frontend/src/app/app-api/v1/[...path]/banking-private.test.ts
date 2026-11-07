import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD, POST } from './route';

const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const url = (path: string, method = 'GET') => new NextRequest(`https://easy-scraping.com/app-api/v1/${path}`, {
  method,
  headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=owner-session' },
});

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function setupUpstream(status: number, body: unknown): void {
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'index, follow',
      'referrer-policy': 'unsafe-url',
    },
  })));
}

function assertPrivate(headers: Headers): void {
  expect(headers.get('cache-control')).toBe('private, no-store');
  expect(headers.get('x-robots-tag')).toBe('noindex');
  expect(headers.get('referrer-policy')).toBe('no-referrer');
}

describe('Android bank and pocket owner response boundary', () => {
  it('overrides public upstream cache and indexing on saving pocket GET 200', async () => {
    setupUpstream(200, [{ id: 'owner-pocket', amount: '100' }]);
    const res = await GET(url('banking/pockets'), ctx('banking', 'pockets'));
    expect(res.status).toBe(200);
    assertPrivate(res.headers);
  });

  it('protects bank standing auth failure 401 even if upstream says index', async () => {
    setupUpstream(401, { statusCode: 401, message: 'login required' });
    const res = await GET(url('banking/standing'), ctx('banking', 'standing'));
    expect(res.status).toBe(401);
    assertPrivate(res.headers);
  });

  it('protects pocket mutation refusal 403 and HEAD response', async () => {
    setupUpstream(403, { statusCode: 403, message: 'csrf required' });
    const post = await POST(url('banking/pockets', 'POST'), ctx('banking', 'pockets'));
    expect(post.status).toBe(403);
    assertPrivate(post.headers);
    setupUpstream(200, { id: 'owner-pocket' });
    const head = await HEAD(url('banking/pockets', 'HEAD'), ctx('banking', 'pockets'));
    expect(head.status).toBe(200);
    assertPrivate(head.headers);
    expect(await head.text()).toBe('');
  });
});
