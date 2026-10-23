import { beforeEach, describe, expect, it, vi } from 'vitest';

const { currentViewerMock, adminMock } = vi.hoisted(() => ({
  currentViewerMock: vi.fn(),
  adminMock: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({
  currentViewer: currentViewerMock,
  isAdministrator: adminMock,
}));
import { DELETE } from './route';

const deleteRequest = (slug: string, purge = false) =>
  new Request(`https://easy-scraping.com/api/admin/blog/${slug}${purge ? '?purge=true' : ''}`, {
    method: 'DELETE',
  });

describe('Admin Blog Delete & Withdraw API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentViewerMock.mockResolvedValue(null);
    adminMock.mockReturnValue(false);
  });

  it('blocks non-administrators from deleting articles', async () => {
    const res = await DELETE(deleteRequest('sample-slug'), {
      params: Promise.resolve({ slug: 'sample-slug' }),
    });
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.code).toBe('FORBIDDEN');
  });

  it('allows administrators to soft-delete (withdraw) an article', async () => {
    adminMock.mockReturnValue(true);
    const res = await DELETE(deleteRequest('2026-10-14-compound-interest-wealth-secret'), {
      params: Promise.resolve({ slug: '2026-10-14-compound-interest-wealth-secret' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.action).toBe('WITHDRAWN');
  });

  it('allows administrators to permanently purge an article with purge=true', async () => {
    adminMock.mockReturnValue(true);
    const res = await DELETE(deleteRequest('2026-10-13-isa-dividend-tax-saving-strategy', true), {
      params: Promise.resolve({ slug: '2026-10-13-isa-dividend-tax-saving-strategy' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.action).toBe('PURGED');
  });
});
