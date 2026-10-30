import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const older = {
  thread_id: '11111111-1111-4111-8111-111111111111',
  subject: 'old',
  status: 'open',
  created_at: '2026-01-01T00:00:00.000Z',
  last_message_at: '2026-01-01T00:00:00.000Z',
};
const newer = {
  thread_id: '22222222-2222-4222-8222-222222222222',
  subject: 'new',
  status: 'resolved',
  created_at: '2026-01-02T00:00:00.000Z',
  last_message_at: '2026-01-02T00:00:00.000Z',
};

describe('Android support oldest-first owner privacy', () => {
  it('forwards sort and preserves private no-store/noindex on verified ascending data', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    const upstream = vi.fn(
      async () =>
        new Response(JSON.stringify({ threads: [older, newer] }), {
          status: 200,
          headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=100' },
        }),
    );
    vi.stubGlobal('fetch', upstream);
    const response = await GET(
      new NextRequest('https://easy-scraping.com/app-api/v1/support/threads?sort=oldest'),
      { params: Promise.resolve({ path: ['support', 'threads'] }) },
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('sort')).toBe('oldest');
  });

  it('fails closed on malformed upstream timestamps instead of reporting an empty verified result', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ threads: [{ ...older, last_message_at: 'not-a-date' }] }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
      ),
    );
    const response = await GET(
      new NextRequest('https://easy-scraping.com/app-api/v1/support/threads?sort=oldest'),
      { params: Promise.resolve({ path: ['support', 'threads'] }) },
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });

  it('fails closed when a stale backend ignores sort and returns descending data', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ threads: [newer, older] }), {
            status: 200,
            headers: { 'content-type': 'application/json' },
          }),
      ),
    );
    const response = await GET(
      new NextRequest('https://easy-scraping.com/app-api/v1/support/threads?sort=oldest'),
      { params: Promise.resolve({ path: ['support', 'threads'] }) },
    );
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
