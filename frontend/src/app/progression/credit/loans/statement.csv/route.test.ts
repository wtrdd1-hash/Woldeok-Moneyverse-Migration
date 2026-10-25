import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, api } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './route';

const data = { scope: 'recent_20_only', loans: [] };
describe('private virtual loan statement download', () => {
  beforeEach(() => vi.resetAllMocks());

  it('refuses guests without calling the loan API', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const res = await GET();
    expect(res.status).toBe(401);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(api).not.toHaveBeenCalled();
  });

  it('does not claim success when authentication, API or schema fails', async () => {
    viewerOrUnknown.mockResolvedValue(null);
    expect((await GET()).status).toBe(503);
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockRejectedValue(new Error('db unavailable'));
    expect((await GET()).status).toBe(503);
    api.mockResolvedValue({ scope: 'all_loans', loans: [] });
    expect((await GET()).status).toBe(503);
  });

  it('downloads bounded owner history privately without indexing', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue(data);
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
    expect(res.headers.get('content-disposition')).toContain('attachment');
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(api).toHaveBeenCalledWith('/api/v1/progression/credit/loans/statement-data');
    expect(await res.text()).toContain('Recent 20 virtual loans only');
  });
});
