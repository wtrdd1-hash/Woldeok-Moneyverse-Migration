import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, mutate } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/mutate', () => ({ mutate }));
import { POST } from './search/route';
const base = { query: '은행', fromUtc: '2026-10-01T00:00:00.000Z', toUtc: '2026-10-30T00:00:00.000Z' };
function request(body: unknown) { return new Request('https://example.test/api/notifications/search', { method: 'POST', headers: { 'content-type': 'application/json', 'x-moneyverse-notification-search': '1', 'sec-fetch-site': 'same-origin' }, body: JSON.stringify(body) }); }
describe('read-only notification search BFF', () => {
  beforeEach(() => { vi.resetAllMocks(); viewerOrUnknown.mockResolvedValue({ signedIn: true }); mutate.mockResolvedValue({ items: [], hasMore: false, nextCursor: null, asOfUtc: '2026-10-29T00:00:00.000Z' }); });
  it('forwards readOnly and enforces private response', async () => {
    const response = await POST(request({ ...base, readOnly: true }));
    expect(response.status).toBe(200);
    expect(mutate).toHaveBeenCalledWith('/api/v1/notifications/search', { body: { ...base, readOnly: true } });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('rejects conflicting or string read-state filters before forwarding', async () => {
    expect((await POST(request({ ...base, readOnly: true, unreadOnly: true }))).status).toBe(400);
    expect((await POST(request({ ...base, readOnly: 'true' }))).status).toBe(400);
    expect(mutate).not.toHaveBeenCalled();
  });
  it('rejects forged unread HTTP 200 on read-only search', async () => {
    mutate.mockResolvedValueOnce({ items: [{ id: '11111111-1111-4111-8111-111111111111', title: 'Bank', body: 'Text', category: 'BANK', isRead: false, createdAt: '2026-10-29T00:00:00.000Z' }], hasMore: false, nextCursor: null, asOfUtc: '2026-10-29T00:00:00.000Z' });
    expect((await POST(request({ ...base, readOnly: true }))).status).toBe(503);
  });
});
