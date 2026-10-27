import { beforeEach, describe, expect, it, vi } from 'vitest';

const { currentViewerMock, adminMock, generateMock, publishMock } = vi.hoisted(() => ({
  currentViewerMock: vi.fn(),
  adminMock: vi.fn(),
  generateMock: vi.fn(),
  publishMock: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({ currentViewer: currentViewerMock, isAdministrator: adminMock }));
vi.mock('@/app/blog/blog-data', () => ({
  generateDailyAiBlogPost: generateMock,
  publishBlogPost: publishMock,
}));
import { POST, GET } from './route';

const request = (headers?: Record<string, string>, body?: unknown) =>
  new Request('https://easy-scraping.com/api/blog/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    body: body ? JSON.stringify(body) : null,
  });

describe('AI blog editorial approval gate', () => {
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

  it('holds scheduler publication without calling generator or disk writer', async () => {
    process.env.INTERNAL_API_SECRET = 'valid-test-secret';
    const res = await POST(request({ 'x-cron-secret': 'valid-test-secret' }));
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe('EDITORIAL_REVIEW_REQUIRED');
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(generateMock).not.toHaveBeenCalled();
    expect(publishMock).not.toHaveBeenCalled();
  });

  it('holds authenticated administrator publication even for valid country and category', async () => {
    adminMock.mockReturnValue(true);
    const res = await POST(request({}, { country: 'US', category: 'TECH' }));
    expect(res.status).toBe(503);
    expect((await res.json()).code).toBe('EDITORIAL_REVIEW_REQUIRED');
    expect(generateMock).not.toHaveBeenCalled();
    expect(publishMock).not.toHaveBeenCalled();
  });

  it('returns explicit hold status instead of claiming ready on authenticated GET', async () => {
    adminMock.mockReturnValue(true);
    const res = await GET(new Request('https://easy-scraping.com/api/blog/generate'));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('EDITORIAL_HOLD');
    expect(data.publicationEnabled).toBe(false);
    expect(data.message).toContain('editorial');
    expect(res.headers.get('cache-control')).toBe('no-store');
  });

  it('rejects unauthorized GET without exposing publication status', async () => {
    const res = await GET(new Request('https://easy-scraping.com/api/blog/generate'));
    expect(res.status).toBe(403);
  });
});
