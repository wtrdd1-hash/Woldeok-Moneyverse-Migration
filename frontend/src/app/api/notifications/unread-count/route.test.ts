// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiMock, viewerMock } = vi.hoisted(() => ({ apiMock: vi.fn(), viewerMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(readonly status: number) { super('upstream error'); }
  },
}));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: viewerMock }));
import { GET } from './route';

beforeEach(() => { apiMock.mockReset(); viewerMock.mockReset(); });

describe('notification unread count is never a fabricated zero', () => {
  it('reports an unknown session as unavailable', async () => {
    viewerMock.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(apiMock).not.toHaveBeenCalled();
  });
  it('requires authentication', async () => {
    viewerMock.mockResolvedValue({ signedIn: false });
    expect((await GET()).status).toBe(401);
    expect(apiMock).not.toHaveBeenCalled();
  });
  it('preserves a genuine zero', async () => {
    viewerMock.mockResolvedValue({ signedIn: true });
    apiMock.mockResolvedValue({ unreadCount: 0 });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ unreadCount: 0 });
  });
  it('rejects invalid upstream counts and network failures', async () => {
    viewerMock.mockResolvedValue({ signedIn: true });
    apiMock.mockResolvedValueOnce({ unreadCount: -1 }).mockRejectedValueOnce(new Error('offline'));
    expect((await GET()).status).toBe(503);
    expect((await GET()).status).toBe(503);
  });
  it('preserves forbidden response without exposing internals', async () => {
    viewerMock.mockResolvedValue({ signedIn: true });
    const { ApiError } = await import('@/lib/api');
    apiMock.mockRejectedValue(new ApiError(403));
    const response = await GET();
    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: 'Unread count unavailable' });
  });
});
