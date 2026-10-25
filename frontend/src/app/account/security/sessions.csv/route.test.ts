import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api';

const apiMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class extends Error {
    readonly status: number;
    constructor(status: number) {
      super('API refused');
      this.status = status;
    }
  },
}));
import { GET } from './route';

const session = { createdAt: '2026-10-26T00:00:00.000Z', lastSeenAt: '2026-10-26T00:00:00.000Z', expiresAt: '2026-11-26T00:00:00.000Z', deviceLabel: 'Android device', current: true, administratorSession: false };
beforeEach(() => apiMock.mockReset());
describe('private active sessions CSV route', () => {
  it('returns owner-bound private CSV with noindex and attachment', async () => {
    apiMock.mockResolvedValue({ limit: 100, complete: true, asOf: '2026-10-26T00:00:00.000Z', sessions: [session] });
    const response = await GET();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/account/security/sessions/export');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain('Android device');
  });
  it('propagates auth/consent refusal and never emits partial data', async () => {
    apiMock.mockRejectedValue(new ApiError(401));
    expect((await GET()).status).toBe(401);
    apiMock.mockRejectedValue(new ApiError(428));
    expect((await GET()).status).toBe(428);
    apiMock.mockResolvedValue({ limit: 100, complete: false, asOf: '2026-10-26T00:00:00.000Z', sessions: [session] });
    expect((await GET()).status).toBe(503);
  });
});
