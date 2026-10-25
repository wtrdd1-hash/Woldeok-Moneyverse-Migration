import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, api } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './route';

describe('owner-only business holdings CSV response', () => {
  beforeEach(() => vi.resetAllMocks());
  it('denies guests and uncertain auth without fetching private holdings', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    expect((await GET()).status).toBe(401);
    viewerOrUnknown.mockResolvedValue(null);
    expect((await GET()).status).toBe(503);
    expect(api).not.toHaveBeenCalled();
  });
  it('never returns a partial or fabricated success on API/schema failure', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockRejectedValue(new Error('db down'));
    expect((await GET()).status).toBe(503);
    api.mockResolvedValue({ scope: 'current_100_max', businesses: [{}] });
    expect((await GET()).status).toBe(503);
  });
  it('returns a private non-indexable CSV even for an empty valid portfolio', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue({ scope: 'current_100_max', businesses: [] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(api).toHaveBeenCalledWith('/api/v1/businesses/ownerships/export-data');
    expect(await response.text()).toContain('Current virtual holdings snapshot only');
  });
});
