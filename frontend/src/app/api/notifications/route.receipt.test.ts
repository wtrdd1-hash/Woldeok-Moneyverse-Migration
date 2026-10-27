import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, mutate } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/mutate', () => ({ mutate }));
import { POST } from './route';

const request = () => new Request('https://example.test/api/notifications', {
  method: 'POST', headers: { 'content-type': 'application/json', 'x-moneyverse-notification-action': '1', 'sec-fetch-site': 'same-origin' },
  body: JSON.stringify({ markAll: true }),
});

describe('notification mark-all verified receipt', () => {
  beforeEach(() => { vi.resetAllMocks(); viewerOrUnknown.mockResolvedValue({ signedIn: true }); });

  it('returns the post-mutation server unread count even when it is positive', async () => {
    mutate.mockResolvedValue({ updatedCount: 3, remainingUnreadCount: 2 });
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ updatedCount: 3, remainingUnreadCount: 2 });
    expect(mutate).toHaveBeenCalledWith('/api/v1/notifications/read-all-receipt');
  });

  it('rejects a fabricated zero when the backend receipt is incomplete', async () => {
    mutate.mockResolvedValue({ updatedCount: 3 });
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).not.toHaveProperty('remainingUnreadCount', 0);
  });
});
