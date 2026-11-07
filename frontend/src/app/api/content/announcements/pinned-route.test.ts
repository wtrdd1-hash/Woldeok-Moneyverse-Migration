import { beforeEach, describe, expect, it, vi } from 'vitest';
const { apiOrNull } = vi.hoisted(() => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
import { GET } from './route';

const pinned = {
  announcementId: '00000000-0000-4000-8000-000000000001',
  title: 'Pinned',
  body: 'Body',
  imageUrl: null,
  imageAltText: null,
  isPinned: true,
  publishedAt: null,
};

beforeEach(() => apiOrNull.mockReset());
describe('published announcement API pinned filter', () => {
  it('forwards pinned-only and validates upstream filter truth', async () => {
    apiOrNull.mockResolvedValue({ announcements: [pinned] });
    const res = await GET(
      new Request('https://example.test/api/content/announcements?pinned=true'),
    );
    expect(res.status).toBe(200);
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/content/announcements?pinned=true');
    expect(res.headers.get('cache-control')).toContain('max-age=60');
  });
  it('rejects duplicates and noncanonical values before any upstream read', async () => {
    for (const query of ['pinned=1', 'pinned=TRUE', 'pinned=true&pinned=false', 'pinned=']) {
      expect(
        (await GET(new Request('https://example.test/api/content/announcements?' + query))).status,
      ).toBe(400);
    }
    expect(apiOrNull).not.toHaveBeenCalled();
  });
  it('never fabricates empty results or trusts an unfiltered HTTP 200', async () => {
    apiOrNull.mockResolvedValueOnce(null);
    expect((await GET(new Request('https://example.test/api/content/announcements'))).status).toBe(
      503,
    );
    apiOrNull.mockResolvedValueOnce({ announcements: [{ ...pinned, isPinned: false }] });
    expect(
      (await GET(new Request('https://example.test/api/content/announcements?pinned=true'))).status,
    ).toBe(503);
    apiOrNull.mockResolvedValueOnce({ announcements: 'invalid' });
    expect((await GET(new Request('https://example.test/api/content/announcements'))).status).toBe(
      503,
    );
  });
});
