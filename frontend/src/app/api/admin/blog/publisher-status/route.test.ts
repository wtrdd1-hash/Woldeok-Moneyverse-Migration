import { beforeEach, describe, expect, it, vi } from 'vitest';

const { viewerMock, adminMock, apiMock } = vi.hoisted(() => ({
  viewerMock: vi.fn(), adminMock: vi.fn(), apiMock: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({
  currentViewer: viewerMock,
  isAdministrator: adminMock,
}));
vi.mock('@/lib/api', () => ({api:apiMock}));
import { GET } from './route';

describe('blog publisher operational status BFF', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    viewerMock.mockResolvedValue(null);
    adminMock.mockReturnValue(false);
  });
  it('never discloses the protected publisher status to nonadministrators', async () => {
    const res = await GET();
    expect(res.status).toBe(403);
    expect(apiMock).not.toHaveBeenCalled();
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
  it('returns an explicit 503 when the backend cannot certify its status', async () => {
    adminMock.mockReturnValue(true);
    apiMock.mockRejectedValue(new Error('backend offline'));
    const res = await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe('PUBLISHER_STATUS_UNAVAILABLE');
  });
  it('forwards a server-derived disabled state without enabling manual writing', async () => {
    adminMock.mockReturnValue(true);
    const status = {success:true, automaticEnabled:false, manualEnabled:false, modelVerified:false};
    apiMock.mockResolvedValue(status);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(status);
    expect(apiMock).toHaveBeenCalledWith('/api/v1/admin/blog-verified/publisher-status', {timeoutMs:5000});
  });
});
