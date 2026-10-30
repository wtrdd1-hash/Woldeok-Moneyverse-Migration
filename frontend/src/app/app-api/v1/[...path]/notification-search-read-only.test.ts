import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
const base = 'https://easy-scraping.com/app-api/v1/notifications/search';
const headers = { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private', 'content-type': 'application/json' };
const filter = { query: '은행', fromUtc: '2026-10-01T00:00:00.000Z', toUtc: '2026-10-30T00:00:00.000Z', readOnly: true };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function setup(items: unknown[]) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ items, hasMore: false, nextCursor: null, asOfUtc: '2026-10-29T00:00:00.000Z' }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}
function request(body: unknown) { return new NextRequest(base, { method: 'POST', headers, body: JSON.stringify(body) }); }
const row = { id: '11111111-1111-4111-8111-111111111111', title: 'Bank', body: 'Text', category: 'BANK', isRead: true, createdAt: '2026-10-29T00:00:00.000Z' };
describe('Android private read-only notification search', () => {
  it('accepts verified read-only results with no-store/noindex', async () => {
    const fetchSpy = setup([row]);
    const response = await POST(request(filter), { params: Promise.resolve({ path: ['notifications', 'search'] }) });
    expect(response.status).toBe(200);
    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects false read-state evidence instead of forwarding HTTP 200', async () => {
    setup([{ ...row, isRead: false }]);
    const response = await POST(request(filter), { params: Promise.resolve({ path: ['notifications', 'search'] }) });
    expect(response.status).toBe(503);
  });
  it('rejects conflicting read and unread filters without forwarding private keywords', async () => {
    const fetchSpy = setup([]);
    const response = await POST(request({ ...filter, unreadOnly: true }), { params: Promise.resolve({ path: ['notifications', 'search'] }) });
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
