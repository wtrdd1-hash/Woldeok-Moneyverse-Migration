import { beforeEach, describe, expect, it, vi } from 'vitest';

const { currentViewerMock, adminMock } = vi.hoisted(() => ({
  currentViewerMock: vi.fn(),
  adminMock: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({
  currentViewer: currentViewerMock,
  isAdministrator: adminMock,
}));
import { POST } from './route';

const request = (headers?: Record<string, string>) =>
  new Request('https://easy-scraping.com/api/blog/generate', { method: 'POST', headers: headers ?? {} });

describe('v716 blog editorial publication gate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.INTERNAL_API_SECRET;
    delete process.env.CRON_SECRET;
    currentViewerMock.mockResolvedValue(null);
    adminMock.mockReturnValue(false);
  });

  it('rejects unauthenticated posting even with the old hardcoded default key', async () => {
    const res = await POST(request({ 'x-cron-secret': 'mv-internal-secure-key-2026' }));
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('BLOG_PUBLISH_FORBIDDEN');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('requires an editorial review despite a valid scheduler credential', async () => {
    process.env.INTERNAL_API_SECRET = 'valid-test-secret';
    const res = await POST(request({ 'x-cron-secret': 'valid-test-secret' }));
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe('EDITORIAL_REVIEW_REQUIRED');
    expect(currentViewerMock).not.toHaveBeenCalled();
  });

  it('blocks even administrators from publishing unverified financial content', async () => {
    adminMock.mockReturnValue(true);
    const res = await POST(request());
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe('EDITORIAL_REVIEW_REQUIRED');
  });

  it('does not contact external crawlers or broadcast to Discord', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    adminMock.mockReturnValue(true);
    await POST(request());
    expect(fetchMock).not.toHaveBeenCalled();
    fetchMock.mockRestore();
  });
});
