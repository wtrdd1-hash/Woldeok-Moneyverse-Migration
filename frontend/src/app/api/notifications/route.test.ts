// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, viewerMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  viewerMock: vi.fn(),
}));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(readonly status: number) { super('upstream error'); }
  },
}));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: viewerMock }));
import { GET } from './route';

const request = (query = '') => new Request(`http://localhost/api/notifications${query}`);
beforeEach(() => { apiMock.mockReset(); viewerMock.mockReset(); });

describe('notification feed BFF does not invent empty results', () => {
  it('returns 503 when session is unavailable', async () => {
    viewerMock.mockResolvedValue(null);
    const response = await GET(request());
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(apiMock).not.toHaveBeenCalled();
  });
  it('returns 401 when signed out', async () => {
    viewerMock.mockResolvedValue({ signedIn: false });
    expect((await GET(request())).status).toBe(401);
    expect(apiMock).not.toHaveBeenCalled();
  });
  it('preserves a genuinely empty inbox', async () => {
    viewerMock.mockResolvedValue({ signedIn: true });
    apiMock.mockResolvedValue([]);
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ notifications: [] });
  });
  it('bounds limit and only forwards unreadOnly=true', async () => {
    viewerMock.mockResolvedValue({ signedIn: true });
    apiMock.mockResolvedValue([]);
    await GET(request('?limit=999999&unreadOnly=true'));
    expect(apiMock).toHaveBeenCalledWith('/api/v1/notifications?limit=100&unreadOnly=true');
    await GET(request('?limit=invalid&unreadOnly=false'));
    expect(apiMock).toHaveBeenLastCalledWith('/api/v1/notifications?limit=50');
  });
  it('returns 503 for network errors and malformed payloads', async () => {
    viewerMock.mockResolvedValue({ signedIn: true });
    apiMock.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: [] });
    expect((await GET(request())).status).toBe(503);
    expect((await GET(request())).status).toBe(503);
  });
  it('preserves upstream forbidden response', async () => {
    viewerMock.mockResolvedValue({ signedIn: true });
    const { ApiError } = await import('@/lib/api');
    apiMock.mockRejectedValue(new ApiError(403));
    expect((await GET(request())).status).toBe(403);
  });
});
