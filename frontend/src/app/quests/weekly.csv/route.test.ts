import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, api } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './route';
describe('private current-week quest CSV download', () => {
  beforeEach(() => vi.resetAllMocks());
  it('refuses guest without accessing API', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(api).not.toHaveBeenCalled();
  });
  it('fails closed when identity or data unavailable', async () => {
    viewerOrUnknown.mockResolvedValue(null);
    expect((await GET()).status).toBe(503);
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockRejectedValue(new Error('database offline'));
    expect((await GET()).status).toBe(503);
    api.mockResolvedValue({ scope: 'all_history', goals: [] });
    expect((await GET()).status).toBe(503);
  });
  it('downloads only a private owner snapshot with anti-indexing headers', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue({ scope: 'current_week_only', goals: [] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(api).toHaveBeenCalledWith('/api/v1/engagement/early-game/weekly-snapshot');
  });
});
