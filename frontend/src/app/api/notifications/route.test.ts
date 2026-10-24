// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, api, mutate } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/mutate', () => ({ mutate }));
import { GET, POST } from './route';

const id = '6e61d245-aed1-4ad3-a57b-b68c19fdb71a';
const notice = { id, category: 'SECURITY_CRITICAL', title: 'Security notice', body: 'New session', is_read: false, created_at: '2026-10-25T00:00:00Z' };
const url = new Request('https://example.test/api/notifications?limit=50');

beforeEach(() => { vi.resetAllMocks(); viewerOrUnknown.mockResolvedValue({ signedIn: true }); });

describe('owner-scoped notification BFF', () => {
  it('rejects malformed backend rows rather than reporting a successful empty feed', async () => {
    api.mockResolvedValue([{ ...notice, is_read: 'false' }]);
    const result = await GET(url);
    expect(result.status).toBe(503);
    expect(await result.json()).not.toHaveProperty('notifications');
  });
  it('returns verified server rows with private no-store caching', async () => {
    api.mockResolvedValue([notice]);
    const result = await GET(url);
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect((await result.json()).notifications).toEqual([notice]);
    expect(api).toHaveBeenCalledWith('/api/v1/notifications?limit=50');
  });
  it('does not expose another member feed when viewer resolution fails', async () => {
    viewerOrUnknown.mockResolvedValue(null);
    const result = await GET(url);
    expect(result.status).toBe(503);
    expect(api).not.toHaveBeenCalled();
  });
  it('requires a confirmed backend read receipt for single notifications', async () => {
    mutate.mockResolvedValue(false);
    const req = new Request('https://example.test/api/notifications', { method: 'POST', headers: { 'content-type': 'application/json', 'x-moneyverse-notification-action': '1', 'sec-fetch-site': 'same-origin' }, body: JSON.stringify({ notificationId: id }) });
    const result = await POST(req);
    expect(result.status).toBe(404);
    expect(mutate).toHaveBeenCalledWith(`/api/v1/notifications/${id}/read`);
  });
});
