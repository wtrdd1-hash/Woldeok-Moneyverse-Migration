import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api, viewerOrUnknown } = vi.hoisted(() => ({ api: vi.fn(), viewerOrUnknown: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
import { GET } from './route';

beforeEach(() => vi.resetAllMocks());

describe('private work assignment CSV route', () => {
  it('refuses anonymous requests without touching member records', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(api).not.toHaveBeenCalled();
  });

  it('fails closed when authentication or database is unavailable', async () => {
    viewerOrUnknown.mockResolvedValue(null);
    expect((await GET()).status).toBe(503);
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockRejectedValue(new Error('DB down'));
    expect((await GET()).status).toBe(503);
  });

  it('sends private non-indexed CSV for the signed-in member', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue({
      scope: 'recent_50_assignments_only', source: 'work_my_assignments',
      limit: 50, generatedAt: '2026-10-26T03:00:00.000Z', assignments: [],
    });
    const response = await GET();
    expect(api).toHaveBeenCalledWith('/api/v1/work/assignments/snapshot');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain('Recent 50 assignments only');
  });
});
