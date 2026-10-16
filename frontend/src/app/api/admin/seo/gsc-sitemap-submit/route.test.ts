import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, mutateMock } = vi.hoisted(() => ({ apiMock: vi.fn(), mutateMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number) {
      super('API refused');
    }
  },
}));
vi.mock('@/lib/mutate', () => ({ mutate: mutateMock }));
import { POST } from './route';
import { ApiError } from '@/lib/api';

const request = (
  origin = 'https://easy-scraping.com',
  sitemapUrl = 'https://easy-scraping.com/sitemap.xml',
) =>
  new Request('https://easy-scraping.com/api/admin/seo/gsc-sitemap-submit', {
    method: 'POST',
    headers: { origin, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
    body: JSON.stringify({ sitemapUrl }),
  });

describe('v719 GSC sitemap submission authority and actual receipts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMock.mockResolvedValue({ consoleSession: { state: 'open' } });
  });
  it('rejects an anonymous request before backend submission', async () => {
    apiMock.mockRejectedValue(new ApiError(401));
    expect((await POST(request())).status).toBe(401);
    expect(mutateMock).not.toHaveBeenCalled();
  });
  it('rejects a non-elevated operator', async () => {
    apiMock.mockResolvedValue({ consoleSession: { state: 'locked' } });
    expect((await POST(request())).status).toBe(403);
    expect(mutateMock).not.toHaveBeenCalled();
  });
  it('rejects cross-origin, missing-origin and untrusted sitemap host', async () => {
    expect((await POST(request('https://attacker.invalid'))).status).toBe(403);
    expect(
      (
        await POST(
          new Request('https://easy-scraping.com/api/admin/seo/gsc-sitemap-submit', {
            method: 'POST',
          }),
        )
      ).status,
    ).toBe(403);
    expect(
      (await POST(request('https://easy-scraping.com', 'https://attacker.invalid/sitemap.xml')))
        .status,
    ).toBe(400);
    expect(mutateMock).not.toHaveBeenCalled();
  });
  it('fails closed when backend submission is unavailable', async () => {
    mutateMock.mockRejectedValue(new ApiError(503));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect((await response.json()).success).toBe(false);
  });
  it('only confirms submission when the real GSC backend confirms success', async () => {
    mutateMock.mockResolvedValue({
      success: true,
      message: 'Submitted by Google API',
      directConsoleUrl: 'https://search.google.com/search-console/sitemaps',
      sitemapUrl: 'https://easy-scraping.com/sitemap.xml',
      propertyUrl: 'sc-domain:easy-scraping.com',
    });
    const response = await POST(request());
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.isGscSubmitted).toBe(true);
    expect(body.indexingConfirmed).toBe(false);
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/seo/gsc/submit-sitemap', {
      body: { sitemapUrl: 'https://easy-scraping.com/sitemap.xml' },
    });
  });
  it('rejects a backend false-success payload rather than inventing a receipt', async () => {
    mutateMock.mockResolvedValue({ success: false });
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect((await response.json()).success).toBe(false);
  });
});
