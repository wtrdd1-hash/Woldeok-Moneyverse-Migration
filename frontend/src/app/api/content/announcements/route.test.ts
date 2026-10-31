import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';
import { apiOrNull } from '@/lib/api';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
const ID = '9adca849-7b28-4dd2-b2df-5f1b77a70001';

afterEach(() => vi.resetAllMocks());

describe('public announcement BFF', () => {
  it('requests the actual Nest public route and preserves verified empty', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce({ announcements: [] });
    const response = await GET();
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/announcements');
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ announcements: [] });
  });
  it('does not turn a missing upstream into a cached empty success', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce(null);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects an unverified HTTP 200 body rather than caching it', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce({ announcements: [{ announcementId: ID, title: 'draft' }] });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
