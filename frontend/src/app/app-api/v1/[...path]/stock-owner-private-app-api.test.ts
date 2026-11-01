import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from './route';

const id = '22222222-2222-4222-8222-222222222222';
const upstreamHeaders = {
  'content-type': 'application/json',
  'cache-control': 'public, max-age=3600',
  'x-robots-tag': 'index,follow',
  'referrer-policy': 'unsafe-url',
};

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function setup(status: number): void {
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: status < 400 }), {
    status, headers: upstreamHeaders,
  })));
}

function req(parts: string[], method = 'GET'): NextRequest {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/${parts.join('/')}`, {
    method,
    headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' },
    ...(method === 'POST' ? { body: JSON.stringify({ watching: true }) } : {}),
  });
}

function expectPrivate(response: Response): void {
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
}

describe('app API owner stock responses must stay private even with public upstream headers', () => {
  it.each([
    ['watchlist', ['stocks', 'watchlist']],
    ['portfolio', ['stocks', 'portfolio']],
    ['history', ['stocks', 'history']],
    ['halt receipts', ['stocks', 'halt-receipts']],
  ])('protects %s on successful and rejected GET', async (_name, parts) => {
    for (const status of [200, 401]) {
      setup(status);
      const response = await GET(req(parts), { params: Promise.resolve({ path: parts }) });
      expect(response.status).toBe(status);
      expectPrivate(response);
    }
  });

  it.each([
    ['watchlist write', ['stocks', id, 'watchlist']],
    ['order receipt', ['stocks', id, 'orders']],
  ])('protects %s on POST 201', async (_name, parts) => {
    setup(201);
    const response = await POST(req(parts, 'POST'), { params: Promise.resolve({ path: parts }) });
    expect(response.status).toBe(201);
    expectPrivate(response);
  });

  it.each([
    ['stocks'],
    ['stocks', 'sparklines'],
    ['stocks', 'market-events'],
    ['stocks', id, 'prices'],
    ['stocks', id, 'candles'],
  ])('preserves public market GET policy for %s', async (...parts) => {
    setup(200);
    const response = await GET(req(parts), { params: Promise.resolve({ path: parts }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=3600');
    expect(response.headers.get('x-robots-tag')).not.toBe('noindex');
  });
});
