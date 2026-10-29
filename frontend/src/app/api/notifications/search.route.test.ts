import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, mutate } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/mutate', () => ({ mutate }));
import { POST } from './search/route';

describe('private notification search BFF', () => {
  beforeEach(() => { vi.resetAllMocks(); viewerOrUnknown.mockResolvedValue({ signedIn: true }); mutate.mockResolvedValue({ items: [], hasMore: false, nextCursor: null, asOfUtc: '2026-10-29T00:00:00Z' }); });
  const valid = { query: '은행', fromUtc: '2026-10-01T00:00:00.000Z', toUtc: '2026-10-30T00:00:00.000Z' };
  it('requires an authenticated same-origin JSON request and never caches private results', async () => {
    const req = new Request('https://example.test/api/notifications/search', { method: 'POST', headers: { 'content-type': 'application/json', 'x-moneyverse-notification-search': '1', 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(valid) });
    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mutate).toHaveBeenCalledWith('/api/v1/notifications/search', { body: valid });
  });
  it('does not forward unauthenticated requests or arbitrary owner fields', async () => {
    viewerOrUnknown.mockResolvedValueOnce({ signedIn: false });
    const request = (body: unknown) => new Request('https://example.test/api/notifications/search', {
      method: 'POST', headers: { 'content-type': 'application/json', 'x-moneyverse-notification-search': '1' },
      body: JSON.stringify(body),
    });
    expect((await POST(request(valid))).status).toBe(401);
    expect((await POST(request({ ...valid, userId: 'other' }))).status).toBe(400);
    expect(mutate).not.toHaveBeenCalled();
  });
  it('rejects invalid or cross-site requests without forwarding keywords', async () => {
    const response = await POST(new Request('https://example.test/api/notifications/search', { method: 'POST', headers: { 'content-type': 'application/json', 'sec-fetch-site': 'cross-site' }, body: JSON.stringify(valid) }));
    expect(response.status).toBe(403);
    expect(mutate).not.toHaveBeenCalled();
  });
});
