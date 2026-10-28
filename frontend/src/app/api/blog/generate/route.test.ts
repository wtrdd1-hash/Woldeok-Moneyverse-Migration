import { beforeEach, describe, expect, it, vi } from 'vitest';

const { currentViewerMock, adminMock } = vi.hoisted(() => ({
  currentViewerMock: vi.fn(),
  adminMock: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({ currentViewer: currentViewerMock, isAdministrator: adminMock }));

import { POST, GET } from './route';

const request = (headers?: Record<string, string>, body?: unknown) =>
  new Request('https://easy-scraping.com/api/blog/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    body: body ? JSON.stringify(body) : null,
  });

describe('retired unverified JSON publisher (verified DB publisher only)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.INTERNAL_API_SECRET;
    delete process.env.CRON_SECRET;
    currentViewerMock.mockResolvedValue(null);
    adminMock.mockReturnValue(false);
  });

  it('rejects unauthenticated publishing without accepted credentials', async () => {
    const res = await POST(request({ 'x-cron-secret': 'invalid-key' }));
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('BLOG_PUBLISH_FORBIDDEN');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('does not publish a synthetic reviewed article with cron credentials', async () => {
    process.env.INTERNAL_API_SECRET = 'valid-test-secret';
    const res = await POST(request({ 'x-cron-secret': 'valid-test-secret' }, { prompt: '테스트 복리 전략' }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.code).toBe('LEGACY_UNVERIFIED_PUBLISHER_RETIRED');
    expect(body).not.toHaveProperty('post');
  });

  it('does not bypass primary-source verification even for an administrator', async () => {
    adminMock.mockReturnValue(true);
    const res = await POST(request({}, { country: 'KR', category: 'COMPOUND' }));
    expect(res.status).toBe(503);
    expect((await res.json()).verifiedBackendPublisher).toBe('blog.rotation_2h');
  });

  it('never reports that legacy file publication is active', async () => {
    adminMock.mockReturnValue(true);
    const res = await GET(new Request('https://easy-scraping.com/api/blog/generate'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('LEGACY_FILE_PUBLISHER_RETIRED');
    expect(body.publicationEnabled).toBe(false);
    expect(body.supportedCountries).toEqual(['KR','US','JP','CN']);
  });

  it('does not reveal editorial internals to unauthenticated visitors', async () => {
    const res = await GET(new Request('https://easy-scraping.com/api/blog/generate'));
    expect(res.status).toBe(403);
  });
});
