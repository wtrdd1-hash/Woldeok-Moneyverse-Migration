import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, mutateMock } = vi.hoisted(() => ({ apiMock: vi.fn(), mutateMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number, public detail = 'request refused') { super(detail); }
  },
}));
vi.mock('@/lib/mutate', () => ({ mutate: mutateMock }));

import { POST } from './route';
import { ApiError } from '@/lib/api';

const makeRequest = (origin?: string, site?: string) =>
  new Request('https://easy-scraping.com/api/admin/seo/twitter', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(origin === undefined ? {} : { origin }),
      ...(site === undefined ? {} : { 'sec-fetch-site': site }),
    },
    body: JSON.stringify({ text: 'operator test' }),
  });

describe('SEO manual X publisher BFF origin and operator boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMock.mockResolvedValue({ consoleSession: { state: 'open' } });
    mutateMock.mockResolvedValue({ success: true, configured: true, tweetId: 'test-id' });
  });

  it.each([
    ['missing Origin', makeRequest()],
    ['cross-origin', makeRequest('https://attacker.invalid', 'cross-site')],
    ['sibling same-site', makeRequest('https://easy-scraping.com', 'same-site')],
  ])('rejects %s before obtaining backend CSRF or publishing', async (_name, req) => {
    const result = await POST(req);
    expect(result.status).toBe(403);
    expect(mutateMock).not.toHaveBeenCalled();
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('rejects a locked operator console before obtaining backend CSRF', async () => {
    apiMock.mockResolvedValue({ consoleSession: { state: 'locked' } });
    const result = await POST(makeRequest('https://easy-scraping.com', 'same-origin'));
    expect(result.status).toBe(403);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('preserves upstream unauthenticated refusal without publishing', async () => {
    apiMock.mockRejectedValue(new ApiError(401));
    const result = await POST(makeRequest('https://easy-scraping.com', 'same-origin'));
    expect(result.status).toBe(401);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('forwards a verified operator request and preserves the success receipt', async () => {
    const result = await POST(makeRequest('https://easy-scraping.com', 'same-origin'));
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({ success: true, configured: true, tweetId: 'test-id' });
    expect(mutateMock).toHaveBeenCalledExactlyOnceWith('/api/v1/seo/twitter/test-tweet', {
      method: 'POST', body: { text: 'operator test' }, timeoutMs: 15_000,
    });
    expect(result.headers.get('cache-control')).toContain('no-store');
  });
});
