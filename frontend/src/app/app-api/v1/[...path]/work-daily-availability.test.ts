import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
const base = 'https://easy-scraping.com/app-api/v1/work/tasks';
const headers = {
  host: 'easy-scraping.com',
  'x-forwarded-proto': 'https',
  cookie: 'moneyverse_session=private',
};

describe('Android work task daily availability', () => {
  it('forwards the filter and forces private no-store and noindex', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            featureState: 'enabled',
            tasks: [
              { task_id: '11111111-1111-4111-8111-111111111111', daily_limit: 3, taken_today: 1 },
              { task_id: '22222222-2222-4222-8222-222222222222', daily_limit: 0, taken_today: 10 },
            ],
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
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(new NextRequest(`${base}?availableOnly=1`, { headers }), {
      params: Promise.resolve({ path: ['work', 'tasks'] }),
    });
    expect(response.status).toBe(200);
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('availableOnly')).toBe(
      '1',
    );
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects exhausted or malformed 200 responses instead of showing false availability', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              featureState: 'enabled',
              tasks: [
                { task_id: '33333333-3333-4333-8333-333333333333', daily_limit: 2, taken_today: 2 },
              ],
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
      ),
    );
    const response = await GET(new NextRequest(`${base}?availableOnly=1`, { headers }), {
      params: Promise.resolve({ path: ['work', 'tasks'] }),
    });
    expect(response.status).toBe(503);
  });
  it('rejects duplicate query values before reaching the backend', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(
      new NextRequest(`${base}?availableOnly=1&availableOnly=1`, { headers }),
      { params: Promise.resolve({ path: ['work', 'tasks'] }) },
    );
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
