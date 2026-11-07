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

const postRequest = (body: unknown = { candidateUrlCount: 2, candidateDigest: '0'.repeat(64) }, origin = 'https://easy-scraping.com') =>
  new Request('https://easy-scraping.com/api/admin/seo-audit', {
    method: 'POST', headers: { origin, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
    body: JSON.stringify(body),
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
    const res = await POST(postRequest(undefined, 'https://attacker.invalid'));
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

  it('does not label malformed crawler measurements as observed', async () => {
    apiMock.mockImplementation(async (path: string) => path === '/api/v1/admin/security'
      ? { consoleSession: { state: 'open' } }
      : { totalHits24h: 10, totalHits7d: 10, avgDurationMs: 4, botDistribution: { Googlebot: 99 } });
    const res = await GET();
    const body = await res.json();
    expect(body.telemetry).toBeNull();
    expect(body.telemetryStatus).toBe('unavailable');
  });

  it('rejects forged IndexNow success without a valid upstream receipt', async () => {
    submitMock.mockResolvedValueOnce({ success: true, submittedCount: '2', status: 202 });
    const { candidateDigest } = await (await GET()).json();
    const res = await POST(postRequest({ candidateUrlCount: 2, candidateDigest }));
    expect(res.status).toBe(502);
    expect((await res.json()).ok).toBe(false);
  });

  it('reports IndexNow acceptance, never confirmed indexing', async () => {
    submitMock.mockResolvedValueOnce({ success: true, submittedCount: 2, status: 202 });
    const { candidateDigest } = await (await GET()).json();
    const res = await POST(postRequest({ candidateUrlCount: 2, candidateDigest }));
    const body = await res.json();
    expect(res.status).toBe(202);
    expect(body.ok).toBe(true);
    expect(body.indexingConfirmed).toBe(false);
    expect(body.submittedCount).toBe(2);
  });


  it('shows the exact candidate URL preview and binds it to a digest with private HTTP headers', async () => {
    const res = await GET();
    const body = await res.json();
    expect(body.candidateUrls).toEqual(['https://easy-scraping.com/', 'https://easy-scraping.com/tools']);
    expect(body.candidateDigest).toMatch(/^[a-f0-9]{64}$/);
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    expect(res.headers.get('cache-control')).toContain('private');
  });

  it('rejects unreviewed, stale or malformed candidate confirmation before external submission', async () => {
    const { candidateDigest } = await (await GET()).json();
    expect((await POST(postRequest())).status).toBe(409);
    expect((await POST(postRequest({ candidateUrlCount: 2, candidateDigest: 'not-a-digest' }))).status).toBe(400);
    expect((await POST(postRequest({ candidateUrlCount: 1, candidateDigest }))).status).toBe(409);
    urlsMock.mockReturnValueOnce(['https://easy-scraping.com/', 'https://easy-scraping.com/new-tools']);
    expect((await POST(postRequest({ candidateUrlCount: 2, candidateDigest }))).status).toBe(409);
    expect((await POST(new Request('https://easy-scraping.com/api/admin/seo-audit', {
      method: 'POST', headers: { origin: 'https://easy-scraping.com' },
    }))).status).toBe(400);
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('blocks invalid or duplicate candidate URLs instead of submitting unknown targets', async () => {
    urlsMock.mockReturnValueOnce(['https://easy-scraping.com/account/security']);
    const res = await GET();
    expect(res.status).toBe(503);
    expect(submitMock).not.toHaveBeenCalled();
  });

  it('submits only the exact reviewed URL list after matching source fingerprint', async () => {
    const { candidateDigest } = await (await GET()).json();
    submitMock.mockResolvedValue({ success: true, submittedCount: 2, status: 202 });
    const res = await POST(postRequest({ candidateUrlCount: 2, candidateDigest }));
    expect(res.status).toBe(202);
    expect(submitMock).toHaveBeenCalledWith(['https://easy-scraping.com/', 'https://easy-scraping.com/tools']);
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('reports failed submissions as failures', async () => {
    submitMock.mockResolvedValueOnce({ success: false, submittedCount: 2, status: 429 });
    const { candidateDigest } = await (await GET()).json();
    const res = await POST(postRequest({ candidateUrlCount: 2, candidateDigest }));
    expect(res.status).toBe(502);
    expect((await res.json()).ok).toBe(false);
  });
});
