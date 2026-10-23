import { beforeEach, describe, expect, it, vi } from 'vitest';

const { currentViewerMock, adminMock, apiMock, deleteMock } = vi.hoisted(() => ({
  currentViewerMock: vi.fn(),
  adminMock: vi.fn(),
  apiMock: vi.fn(),
  deleteMock: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({ currentViewer: currentViewerMock, isAdministrator: adminMock }));
vi.mock('@/lib/api', () => ({ api: apiMock, ApiError: class ApiError extends Error {} }));
vi.mock('@/app/blog/blog-data', () => ({ deleteBlogPost: deleteMock }));
import { DELETE } from './route';

const slug = '2026-10-14-compound-interest-wealth-secret';
const browserHeaders = { origin: 'https://easy-scraping.com', 'sec-fetch-site': 'same-origin' };
const deleteRequest = (purge = false, headers: Record<string, string> = browserHeaders) =>
  new Request(`https://easy-scraping.com/api/admin/blog/${slug}${purge ? '?purge=true' : ''}`, {
    method: 'DELETE', headers,
  });
const callDelete = (request: Request) => DELETE(request, { params: Promise.resolve({ slug }) });

describe('Admin Blog Withdraw and Purge API authorization', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    currentViewerMock.mockResolvedValue(null);
    adminMock.mockReturnValue(false);
    apiMock.mockResolvedValue({ consoleSession: { state: 'open' } });
    deleteMock.mockReturnValue(true);
  });

  it('blocks non-administrators from deleting articles', async () => {
    expect((await callDelete(deleteRequest())).status).toBe(403);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('blocks admin deletes without Origin or with cross-site request headers', async () => {
    adminMock.mockReturnValue(true);
    for (const headers of [
      {},
      { origin: 'https://attacker.invalid' },
      { origin: 'https://easy-scraping.com', 'sec-fetch-site': 'cross-site' },
    ]) {
      expect((await callDelete(deleteRequest(false, headers))).status).toBe(403);
    }
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('requires an open backend elevated console session', async () => {
    adminMock.mockReturnValue(true);
    apiMock.mockResolvedValue({ consoleSession: { state: 'locked' } });
    expect((await callDelete(deleteRequest())).status).toBe(403);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('fails closed when backend authority is unreachable', async () => {
    adminMock.mockReturnValue(true);
    apiMock.mockRejectedValue(new Error('unreachable'));
    expect((await callDelete(deleteRequest())).status).toBe(503);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('allows same-origin elevated administrator to withdraw without purge', async () => {
    adminMock.mockReturnValue(true);
    const res = await callDelete(deleteRequest());
    expect(res.status).toBe(200);
    expect((await res.json()).action).toBe('WITHDRAWN');
    expect(deleteMock).toHaveBeenCalledWith(slug, false);
  });

  it('requires explicit matching confirmation before irreversible purge', async () => {
    adminMock.mockReturnValue(true);
    for (const headers of [browserHeaders, { ...browserHeaders, 'x-blog-purge-confirmation': 'different-slug' }]) {
      expect((await callDelete(deleteRequest(true, headers))).status).toBe(428);
    }
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it('allows confirmed purge only for an elevated same-origin administrator', async () => {
    adminMock.mockReturnValue(true);
    const res = await callDelete(deleteRequest(true, {
      ...browserHeaders,
      'x-blog-purge-confirmation': slug,
    }));
    expect(res.status).toBe(200);
    expect((await res.json()).action).toBe('PURGED');
    expect(deleteMock).toHaveBeenCalledWith(slug, true);
  });
});
