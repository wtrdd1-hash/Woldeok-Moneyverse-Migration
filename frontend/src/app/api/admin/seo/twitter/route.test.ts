import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, mutateMock } = vi.hoisted(() => ({ apiMock: vi.fn(), mutateMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number) { super('API refused'); }
  },
}));
vi.mock('@/lib/mutate', () => ({ mutate: mutateMock }));

import { POST } from './route';

function request(origin?: string, site = 'same-origin'): Request {
  return new Request('https://easy-scraping.com/api/admin/seo/twitter', {
    method: 'POST',
    headers: {
      ...(origin === undefined ? {} : { origin }),
      'sec-fetch-site': site,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ text: 'Public virtual-economy announcement' }),
  });
}

describe('admin X publication authority and verified receipts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMock.mockResolvedValue({ consoleSession: { state: 'open' } });
  });

  it('rejects cross-site and missing-Origin browser writes before contacting backend', async () => {
    expect((await POST(request('https://attacker.invalid'))).status).toBe(403);
    expect((await POST(request())).status).toBe(403);
    expect((await POST(request('https://easy-scraping.com', 'cross-site'))).status).toBe(403);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('rejects an operator without an elevated console session', async () => {
    apiMock.mockResolvedValue({ consoleSession: { state: 'locked' } });
    expect((await POST(request('https://easy-scraping.com'))).status).toBe(403);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('rejects missing X publication evidence even if upstream claims success', async () => {
    mutateMock.mockResolvedValue({ success: true, configured: true });
    const response = await POST(request('https://easy-scraping.com'));
    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({ success: false, error: 'twitter_receipt_unverified' });
  });

  it('only returns success for an upstream verified X publication ID', async () => {
    mutateMock.mockResolvedValue({ success: true, configured: true, tweetId: '1900000000000000000' });
    const response = await POST(request('https://easy-scraping.com'));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true, tweetId: '1900000000000000000' });
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/seo/twitter/test-tweet', {
      method: 'POST',
      body: { text: 'Public virtual-economy announcement' },
      timeoutMs: 15_000,
    });
  });
});
