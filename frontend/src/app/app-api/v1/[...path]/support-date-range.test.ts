import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const context = { params: Promise.resolve({ path: ['support', 'threads'] }) };
const request = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/support/threads?${query}`, {
  headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=owner' },
});
beforeEach(() => { vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32)); });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android owner support date-range parity', () => {
  it('rejects duplicate/partial dates before calling backend', async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const query of ['from=2026-10-30', 'from=2026-10-30&to=2026-10-31&to=2026-10-31', 'from=2026-02-30&to=2026-03-01']) {
      expect((await GET(request(query), context)).status).toBe(400);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('rejects legacy 200 rows outside the KST window', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ threads: [{
      thread_id: '11111111-1111-4111-8111-111111111111', subject: 'Billing', status: 'resolved',
      last_message_at: '2026-10-29T14:59:59.000Z',
    }] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('from=2026-10-30&to=2026-10-31'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('forwards validated date filters, preserves private headers, and accepts in-window rows', async () => {
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ threads: [{
      thread_id: '11111111-1111-4111-8111-111111111111', subject: 'Billing', status: 'resolved',
      last_message_at: '2026-10-29T15:00:00.000Z',
    }] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('from=2026-10-30&to=2026-10-31&status=resolved'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [target] = fetchSpy.mock.calls[0]!;
    expect(new URL(String(target)).searchParams.get('from')).toBe('2026-10-30');
  });
});
