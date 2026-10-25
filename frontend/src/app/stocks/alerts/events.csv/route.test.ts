import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, api } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './route';

describe('authenticated virtual-stock alert trigger CSV route', () => {
  beforeEach(() => vi.resetAllMocks());
  it('rejects guests before querying the API', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(api).not.toHaveBeenCalled();
  });
  it('fails closed on unknown identity, backend failure or unverified snapshot', async () => {
    viewerOrUnknown.mockResolvedValue(null);
    expect((await GET()).status).toBe(503);
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockRejectedValueOnce(new Error('database offline'));
    expect((await GET()).status).toBe(503);
    api.mockResolvedValueOnce({ scope: 'all_history', events: [] });
    expect((await GET()).status).toBe(503);
  });
  it('downloads a private, noindex CSV only for an authenticated member', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue({ scope: 'recent_100_max', events: [] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(api).toHaveBeenCalledWith('/api/v1/stocks/alerts/events/snapshot');
  });
});
