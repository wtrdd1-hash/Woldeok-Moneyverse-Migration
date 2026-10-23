import { beforeEach, describe, expect, it, vi } from 'vitest';

const { currentViewerMock, adminMock } = vi.hoisted(() => ({
  currentViewerMock: vi.fn(),
  adminMock: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({
  currentViewer: currentViewerMock,
  isAdministrator: adminMock,
}));
import { POST, GET } from './route';

const request = (headers?: Record<string, string>) =>
  new Request('https://easy-scraping.com/api/blog/generate', { method: 'POST', headers: headers ?? {} });

describe('AI blog editorial publication engine', () => {
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

  it('allows publication when authenticated with valid scheduler credential', async () => {
    process.env.INTERNAL_API_SECRET = 'valid-test-secret';
    const res = await POST(request({ 'x-cron-secret': 'valid-test-secret' }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.post).toBeDefined();
    expect(data.post.slug).toBeDefined();
    expect(data.post.title).toBeDefined();
  });

  it('allows administrators to trigger verified AI blog publication', async () => {
    adminMock.mockReturnValue(true);
    const res = await POST(request());
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.post.url).toMatch(/^\/blog\//);
  });

  it('provides ready status on GET for administrators', async () => {
    adminMock.mockReturnValue(true);
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('READY');
  });
});
