import { beforeEach, describe, expect, it, vi } from 'vitest';
import { realAuction } from '@/app/marketplace/auction-feed.fixture';

const { apiMock, viewerMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  viewerMock: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api: apiMock }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: viewerMock }));
import { GET } from './route';

describe('private verified marketplace auction gateway', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ signedIn: true });
  });
  it('returns verified backend rows and privacy/SEO headers', async () => {
    apiMock.mockResolvedValue([realAuction]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ auctions: [realAuction] });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(apiMock).toHaveBeenCalledWith('/api/v1/marketplace/auctions');
  });
  it('does not treat valid empty results as unavailable', async () => {
    apiMock.mockResolvedValue([]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ auctions: [] });
  });
  it('blocks anonymous viewers and does not call backend', async () => {
    viewerMock.mockResolvedValue({ signedIn: false });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(apiMock).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('fails closed on backend errors and malformed rows', async () => {
    apiMock.mockRejectedValueOnce(new Error('database offline')).mockResolvedValueOnce([{ ...realAuction, id: 'auc_01' }]);
    expect((await GET()).status).toBe(503);
    expect((await GET()).status).toBe(503);
  });
});
