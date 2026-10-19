import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, submitMock } = vi.hoisted(() => ({ apiMock: vi.fn(), submitMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number) {
      super('API refused');
    }
  },
}));
vi.mock('@/lib/indexnow', () => ({ submitToIndexNow: submitMock }));

import { POST } from './route';
import { ApiError } from '@/lib/api';

const req = (origin = 'https://easy-scraping.com') =>
  new Request('https://easy-scraping.com/api/admin/seo/indexing-submit', {
    method: 'POST',
    headers: { origin, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
    body: JSON.stringify({ batchSize: 2 }),
  });

describe('v719 SEO indexing submit safety', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMock.mockResolvedValue({ consoleSession: { state: 'open' } });
  });
  it('requires a logged-in operator before submitting', async () => {
    apiMock.mockRejectedValue(new ApiError(401));
    expect((await POST(req())).status).toBe(401);
    expect(submitMock).not.toHaveBeenCalled();
  });
  it('requires an open admin console', async () => {
    apiMock.mockResolvedValue({ consoleSession: { state: 'locked' } });
    expect((await POST(req())).status).toBe(403);
    expect(submitMock).not.toHaveBeenCalled();
  });
  it('rejects cross-origin and missing-origin requests before any side effects', async () => {
    expect((await POST(req('https://attacker.invalid'))).status).toBe(403);
    expect(
      (
        await POST(
          new Request('https://easy-scraping.com/api/admin/seo/indexing-submit', {
            method: 'POST',
          }),
        )
      ).status,
    ).toBe(403);
    expect(submitMock).not.toHaveBeenCalled();
  });
  it('returns an error when upstream IndexNow failed', async () => {
    submitMock.mockResolvedValue({ success: false, submittedCount: 2, status: 429 });
    const response = await POST(req());
    expect(response.status).toBe(502);
    expect((await response.json()).success).toBe(false);
  });
  it('does not claim Google indexing from IndexNow acceptance', async () => {
    submitMock.mockResolvedValue({ success: true, submittedCount: 2, status: 202 });
    const response = await POST(req());
    const body = await response.json();
    expect(response.status).toBe(202);
    expect(body.success).toBe(true);
    expect(body.indexingConfirmed).toBe(false);
    expect(body.googlePingSuccess).toBeUndefined();
    expect(body.message).not.toMatch(/Google Indexing API|색인 완료/);
  });
});


describe('v930 category-scoped IndexNow notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMock.mockResolvedValue({ consoleSession: { state: 'open' } });
    submitMock.mockImplementation(async (urls: string[]) => ({
      success: true, submittedCount: urls.length, status: 202,
    }));
  });

  const scopedRequest = (targetCategory: string, batchSize = 200) =>
    new Request('https://easy-scraping.com/api/admin/seo/indexing-submit', {
      method: 'POST',
      headers: { origin: 'https://easy-scraping.com', 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
      body: JSON.stringify({ targetCategory, batchSize }),
    });

  it('rejects unknown categories without sending requests', async () => {
    const response = await POST(scopedRequest('invalid'));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('invalid_target_category');
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('sends only stock pSEO URLs for pseo category', async () => {
    const response = await POST(scopedRequest('pseo'));
    const urls = submitMock.mock.calls[0]?.[0] as string[];
    expect(response.status).toBe(202);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.every((url) => url.includes('/tools/stock-calculator/'))).toBe(true);
    expect((await response.json()).indexingConfirmed).toBe(false);
  });

  it('excludes stock pSEO URLs from calculators category', async () => {
    const response = await POST(scopedRequest('calculators'));
    const urls = submitMock.mock.calls[0]?.[0] as string[];
    expect(response.status).toBe(202);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.some((url) => url.includes('/tools/stock-calculator/'))).toBe(false);
  });
});
