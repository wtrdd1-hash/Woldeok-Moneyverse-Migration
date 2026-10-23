import { beforeEach, describe, expect, it, vi } from 'vitest';

const { currentViewerMock, adminMock, apiMock, generateMock, publishMock } = vi.hoisted(() => ({
  currentViewerMock: vi.fn(),
  adminMock: vi.fn(),
  apiMock: vi.fn(),
  generateMock: vi.fn(),
  publishMock: vi.fn(),
}));
vi.mock('@/lib/viewer', () => ({ currentViewer: currentViewerMock, isAdministrator: adminMock }));
vi.mock('@/lib/api', () => ({ api: apiMock, ApiError: class ApiError extends Error {} }));
vi.mock('@/app/blog/blog-data', () => ({
  generateDailyAiBlogPost: generateMock,
  publishBlogPost: publishMock,
}));
import { POST, GET } from './route';

const request = (headers?: Record<string, string>, body?: object) =>
  new Request('https://easy-scraping.com/api/blog/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers ?? {}) },
    body: body ? JSON.stringify(body) : null,
  });

const browserHeaders = {
  origin: 'https://easy-scraping.com',
  'sec-fetch-site': 'same-origin',
};

describe('AI blog generator authorization', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    delete process.env.INTERNAL_API_SECRET;
    delete process.env.CRON_SECRET;
    currentViewerMock.mockResolvedValue(null);
    adminMock.mockReturnValue(false);
    apiMock.mockResolvedValue({ consoleSession: { state: 'open' } });
    generateMock.mockImplementation(({ country, category } = {}) => ({
      slug: '2026-10-23-kr-wealth-test',
      title: 'Test article',
      category: category ?? 'WEALTH',
      categoryLabel: 'Wealth',
      country: country ?? 'KR',
      publishedAt: '2026-10-23T12:00:00Z',
    }));
  });

  it('rejects unauthenticated publication', async () => {
    const res = await POST(request({ 'x-cron-secret': 'invalid-key' }));
    expect(res.status).toBe(403);
    expect(publishMock).not.toHaveBeenCalled();
    expect(res.headers.get('cache-control')).toContain('no-store');
  });

  it('keeps valid scheduler authentication independent of browser Origin', async () => {
    process.env.INTERNAL_API_SECRET = 'valid-test-secret';
    const res = await POST(request({ 'x-cron-secret': 'valid-test-secret' }));
    expect(res.status).toBe(201);
    expect(publishMock).toHaveBeenCalledTimes(1);
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('blocks cookie-based admin publication without Origin even with a valid role', async () => {
    adminMock.mockReturnValue(true);
    expect((await POST(request())).status).toBe(403);
    expect(publishMock).not.toHaveBeenCalled();
  });

  it('blocks cross-origin and cross-site browser writes', async () => {
    adminMock.mockReturnValue(true);
    for (const headers of [
      { origin: 'https://attacker.invalid' },
      { origin: 'https://easy-scraping.com', 'sec-fetch-site': 'cross-site' },
    ]) {
      expect((await POST(request(headers))).status).toBe(403);
    }
    expect(publishMock).not.toHaveBeenCalled();
  });

  it('blocks admin writes while elevated console is locked', async () => {
    adminMock.mockReturnValue(true);
    apiMock.mockResolvedValue({ consoleSession: { state: 'locked' } });
    expect((await POST(request(browserHeaders))).status).toBe(403);
    expect(publishMock).not.toHaveBeenCalled();
  });

  it('blocks admin writes when the backend console authority is unavailable', async () => {
    adminMock.mockReturnValue(true);
    apiMock.mockRejectedValue(new Error('backend offline'));
    expect((await POST(request(browserHeaders))).status).toBe(503);
    expect(publishMock).not.toHaveBeenCalled();
  });

  it('allows elevated same-origin admins to generate the selected country and category', async () => {
    adminMock.mockReturnValue(true);
    const res = await POST(request(browserHeaders, { country: 'US', category: 'TECH' }));
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.post.category).toBe('TECH');
    expect(data.post.country).toBe('US');
    expect(publishMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the read-only generator status available to administrators', async () => {
    adminMock.mockReturnValue(true);
    const res = await GET(new Request('https://easy-scraping.com/api/blog/generate'));
    expect(res.status).toBe(200);
    expect((await res.json()).supportedCountries).toContain('KR');
  });
});
