import { beforeEach, describe, expect, it, vi } from 'vitest';
const apiMock = vi.fn();
const viewerMock = vi.fn();
vi.mock('@/lib/api', () => ({ api: (...args: unknown[]) => apiMock(...args) }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: () => viewerMock() }));
import { GET } from './route';
describe('notification unread-count evidence', () => {
  beforeEach(() => { vi.resetAllMocks(); viewerMock.mockResolvedValue({ signedIn: true }); });
  it('returns only the verified unread count, not unexpected upstream member fields', async () => {
    apiMock.mockResolvedValue({ unreadCount: 3, email: 'private@example.test', token: 'secret' });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ unreadCount: 3 });
  });
  it('rejects invalid counts without echoing upstream data', async () => {
    apiMock.mockResolvedValue({ unreadCount: '3', email: 'private@example.test' });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('private@example.test');
  });
});
