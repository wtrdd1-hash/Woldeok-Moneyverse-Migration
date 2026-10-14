import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, submitMock, urlsMock } = vi.hoisted(() => ({
  apiMock: vi.fn(),
  submitMock: vi.fn(),
  urlsMock: vi.fn(() => ['https://easy-scraping.com/', 'https://easy-scraping.com/tools']),
}));

vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number) { super('API denied'); }
  },
}));
vi.mock('@/lib/indexnow', () => ({
  getAllPublicUrlsForIndexNow: urlsMock,
  submitToIndexNow: submitMock,
}));

import { GET, POST } from './route';

const postRequest = (origin = 'https://easy-scraping.com') =>
  new Request('https://easy-scraping.com/api/admin/seo-audit', {
    method: 'POST', headers: { origin, 'sec-fetch-site': 'same-origin' },
  });

describe('admin SEO audit: real authority and honest evidence', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    urlsMock.mockReturnValue(['https://easy-scraping.com/', 'https://easy-scraping.com/tools']);
    apiMock.mockImplementation(async (path: string) => {
      if (path === '/api/v1/admin/security') return { consoleSession: { state: 'open' } };
      if (path === '/api/v1/seo/status') return {
        totalHits24h: 12, totalHits7d: 30, avgDurationMs: 87,
        botDistribution: { Googlebot: 7 }, recentLogs: [],
      };
      throw new Error('Unexpected backend route');
    });
  });

  it('refuses anonymous reads without revealing inventory', async () => {
    const { ApiError } = await import('@/lib/api');
    apiMock.mockRejectedValueOnce(new ApiError(401));
    const res = await GET();
    expect(res.status).toBe(401);
    expect(urlsMock).not.toHaveBeenCalled();
  });

  it('refuses a locked admin console before submitting', async () => {
    apiMock.mockResolvedValueOnce({ consoleSession: { state: 'locked' } });
    const res = await POST(postRequest());
    expect(res.status).toBe(403);
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('rejects cross-origin requests before side effects', async () => {
    const res = await POST(postRequest('https://attacker.invalid'));
    expect(res.status).toBe(403);
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('rejects requests missing an origin', async () => {
    const res = await POST(new Request('https://easy-scraping.com/api/admin/seo-audit', { method: 'POST' }));
    expect(res.status).toBe(403);
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('reports observed crawler telemetry, not invented indexing success', async () => {
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(body.candidateUrlCount).toBe(2);
    expect(body.telemetry.totalHits24h).toBe(12);
    expect(body.telemetry.avgDurationMs).toBe(87);
    expect(body.indexingStatus).toBe('not_measured');
    expect(body.schemaValidationStatus).toBe('not_measured');
    expect(JSON.stringify(body)).not.toContain('99.4%');
  });

  it('marks telemetry unavailable rather than zero or healthy', async () => {
    apiMock.mockImplementation(async (path: string) => {
      if (path === '/api/v1/admin/security') return { consoleSession: { state: 'open' } };
      throw new Error('SEO backend offline');
    });
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.telemetry).toBeNull();
    expect(body.telemetryStatus).toBe('unavailable');
  });

  it('reports IndexNow acceptance, never confirmed indexing', async () => {
    submitMock.mockResolvedValueOnce({ success: true, submittedCount: 2, status: 202 });
    const res = await POST(postRequest());
    const body = await res.json();
    expect(res.status).toBe(202);
    expect(body.ok).toBe(true);
    expect(body.indexingConfirmed).toBe(false);
    expect(body.submittedCount).toBe(2);
  });

  it('reports failed submissions as failures', async () => {
    submitMock.mockResolvedValueOnce({ success: false, submittedCount: 2, status: 429 });
    const res = await POST(postRequest());
    expect(res.status).toBe(502);
    expect((await res.json()).ok).toBe(false);
  });
});
