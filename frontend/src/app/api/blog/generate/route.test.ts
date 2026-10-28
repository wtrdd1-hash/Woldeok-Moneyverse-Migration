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

describe('AI blog 7,000-char generation & editorial engine', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.INTERNAL_API_SECRET;
    delete process.env.CRON_SECRET;
    currentViewerMock.mockResolvedValue(null);
    adminMock.mockReturnValue(false);
  });

  it('rejects unauthenticated posting without valid credentials', async () => {
    const res = await POST(request({ 'x-cron-secret': 'invalid-key' }));
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe('BLOG_PUBLISH_FORBIDDEN');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('generates deep longform article with valid cron secret', async () => {
    process.env.INTERNAL_API_SECRET = 'valid-test-secret';
    const res = await POST(request({ 'x-cron-secret': 'valid-test-secret' }, { prompt: '테스트 복리 전략' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.post).toBeDefined();
    expect(body.post.charCount).toBeGreaterThan(5000);
    expect(body.post.verificationReceipt).toBeDefined();
  });

  it('generates deep longform article with authenticated administrator', async () => {
    adminMock.mockReturnValue(true);
    const res = await POST(request({}, { country: 'KR', category: 'COMPOUND' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.post.charCount).toBeGreaterThan(5000);
  });

  it('returns active status on authenticated GET', async () => {
    adminMock.mockReturnValue(true);
    const res = await GET(new Request('https://easy-scraping.com/api/blog/generate'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.status).toBe('ACTIVE');
    expect(body.publicationEnabled).toBe(true);
  });
});
