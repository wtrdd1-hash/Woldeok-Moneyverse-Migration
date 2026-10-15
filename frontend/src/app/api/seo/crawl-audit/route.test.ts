import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from '@/lib/api';
import { mutate } from '@/lib/mutate';
import { GET, POST } from './route';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(
      public readonly status: number,
      detail?: string,
    ) {
      super(detail);
    }
  },
}));
vi.mock('@/lib/mutate', () => ({ mutate: vi.fn() }));

describe('SEO crawl-audit proxy fail-closed behavior', () => {
  afterEach(() => vi.resetAllMocks());

  it('does not invent a healthy crawl when GET cannot reach the backend', async () => {
    vi.mocked(api).mockRejectedValue(new Error('offline'));
    const response = await GET();
    const result = await response.json();
    expect(response.status).toBe(503);
    expect(result.totalUrlsChecked).toBeUndefined();
    expect(result.error).toBeTruthy();
  });

  it('does not invent a completed crawl when POST cannot reach the backend', async () => {
    vi.mocked(mutate).mockRejectedValue(new Error('offline'));
    const response = await POST();
    const result = await response.json();
    expect(response.status).toBe(503);
    expect(result.healthyUrls).toBeUndefined();
    expect(result.error).toBeTruthy();
  });

  it('uses the authenticated internal API for reads and CSRF-bearing mutation for triggers', async () => {
    vi.mocked(api).mockResolvedValueOnce({ status: 'not_run', healthyUrls: 0 });
    vi.mocked(mutate).mockResolvedValueOnce({ totalUrlsChecked: 2, healthyUrls: 2 });
    expect((await GET()).status).toBe(200);
    expect((await POST()).status).toBe(200);
    expect(api).toHaveBeenCalledWith('/api/v1/seo/crawl-audit', { timeoutMs: 20_000 });
    expect(mutate).toHaveBeenCalledWith('/api/v1/seo/crawl-audit', {
      method: 'POST',
      body: {},
      timeoutMs: 60_000,
    });
  });

  it('preserves an administrator authorization rejection instead of returning healthy data', async () => {
    vi.mocked(api).mockRejectedValue(new ApiError(403, 'forbidden'));
    const response = await GET();
    expect(response.status).toBe(403);
    expect((await response.json()).healthyUrls).toBeUndefined();
  });
});
