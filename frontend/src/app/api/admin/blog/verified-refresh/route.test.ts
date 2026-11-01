import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  viewer: vi.fn(), isAdmin: vi.fn(), api: vi.fn(), project: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({ currentViewer: mocks.viewer, isAdministrator: mocks.isAdmin }));
vi.mock('@/lib/api', () => ({ api: mocks.api }));
vi.mock('@/app/blog/blog-verified-client', () => ({ verifiedArticlesForAdmin: mocks.project }));
import { GET } from './route';

const verified = { slug: '2026-11-02-verified-entry', title: 'Verified entry', verificationReceipt: '11111111-1111-4111-8111-111111111111', status: 'PUBLISHED' };

describe('admin blog verified refresh BFF', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.viewer.mockResolvedValue(null);
    mocks.isAdmin.mockReturnValue(false);
  });

  it('rejects nonadministrators before reading backend', async () => {
    const response = await GET();
    expect(response.status).toBe(403);
    expect(mocks.api).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('returns a private 503 when the viewer authority cannot be established', async () => {
    mocks.viewer.mockRejectedValue(new Error('session unavailable'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(mocks.api).not.toHaveBeenCalled();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('rejects duplicate verified article identities rather than showing ambiguous rows', async () => {
    mocks.isAdmin.mockReturnValue(true);
    mocks.api.mockResolvedValue({ posts: [{ slug: verified.slug }, { slug: verified.slug }] });
    mocks.project.mockReturnValue([verified, verified]);
    const response = await GET();
    expect(response.status).toBe(503);
  });

  it('fails closed on backend outages without returning a successful empty list', async () => {
    mocks.isAdmin.mockReturnValue(true);
    mocks.api.mockRejectedValue(new Error('backend offline'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ success: false, code: 'VERIFIED_BLOG_UNAVAILABLE' });
  });

  it('rejects missing, partial and malformed backend evidence', async () => {
    mocks.isAdmin.mockReturnValue(true);
    for (const payload of [{}, { posts: {} }, { posts: [{ slug: 'bad' }] }, { posts: new Array(501).fill({}) }]) {
      mocks.api.mockResolvedValueOnce(payload);
      mocks.project.mockReturnValueOnce([]);
      const response = await GET();
      expect(response.status).toBe(503);
    }
  });

  it('returns verified DB entries with private headers and no legacy articles', async () => {
    mocks.isAdmin.mockReturnValue(true);
    mocks.api.mockResolvedValue({ posts: [{ slug: verified.slug }] });
    mocks.project.mockReturnValue([verified]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, verifiedCount: 1, posts: [verified] });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(mocks.api).toHaveBeenCalledWith('/api/v1/admin/blog-verified', { timeoutMs: 5000 });
  });

  it('distinguishes an authoritative empty list from an outage', async () => {
    mocks.isAdmin.mockReturnValue(true);
    mocks.api.mockResolvedValue({ posts: [] });
    mocks.project.mockReturnValue([]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, verifiedCount: 0, posts: [] });
  });
});
