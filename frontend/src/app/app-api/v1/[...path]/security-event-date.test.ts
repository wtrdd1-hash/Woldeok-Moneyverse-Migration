import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const context = { params: Promise.resolve({ path: ['account', 'security', 'events'] }) };

describe('Android owner security event KST date filter', () => {
  it('rejects duplicate and invalid date parameters before proxying', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    for (const query of [
      'from=2026-10-30',
      'from=2026-10-30&to=2026-10-30&to=2026-10-31',
      'from=2026-02-29&to=2026-03-01',
    ]) {
      const response = await GET(
        new NextRequest(`https://easy-scraping.com/app-api/v1/account/security/events?${query}`),
        context,
      );
      expect(response.status).toBe(400);
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it('accepts owner-private in-range evidence without stripping the requested dates', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            events: [{ type: 'local_login_succeeded', createdAt: '2026-10-29T15:00:00.000Z' }],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );
    vi.stubGlobal('fetch', upstream);
    const response = await GET(
      new NextRequest(
        'https://easy-scraping.com/app-api/v1/account/security/events?category=login&from=2026-10-30&to=2026-10-30',
      ),
      context,
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(new URL(String(upstream.mock.calls[0]![0])).searchParams.get('to')).toBe('2026-10-30');
  });
  it('fails closed on out-of-range 200 evidence and preserves private headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            events: [{ type: 'local_login_succeeded', createdAt: '2026-10-30T15:00:00.000Z' }],
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json',
              'cache-control': 'public, max-age=3600',
            },
          },
        ),
    );
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest(
      'https://easy-scraping.com/app-api/v1/account/security/events?from=2026-10-30&to=2026-10-30',
    );
    const response = await GET(request, context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]![0])).searchParams.get('from')).toBe('2026-10-30');
  });
});
