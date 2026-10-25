import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { GET } from './route';

vi.mock('@/lib/api', () => ({ api: vi.fn() }));

describe('published announcement gateway', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns only the existing backend published announcements contract', async () => {
    vi.mocked(api).mockResolvedValueOnce({ announcements: [{ announcementId: 'real', title: 'published' }] });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toEqual({ announcements: [{ announcementId: 'real', title: 'published' }] });
    expect(api).toHaveBeenCalledWith('/api/v1/content/announcements');
  });

  it('returns 503 rather than a fabricated empty successful feed when backend is unavailable', async () => {
    vi.mocked(api).mockRejectedValueOnce(new Error('database unavailable'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(await response.json()).toEqual({ error: 'Published announcements unavailable' });
  });

  it('rejects a malformed backend response instead of acknowledging an empty feed', async () => {
    vi.mocked(api).mockResolvedValueOnce({ invalid: true });
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});
