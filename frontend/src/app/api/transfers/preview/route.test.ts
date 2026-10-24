import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from '@/lib/api';
import { GET } from './route';

vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error { constructor(public status: number) { super('private api error'); } },
  api: vi.fn(),
}));

afterEach(() => vi.resetAllMocks());

describe('same-origin transfer preview', () => {
  it('passes only canonical validated parameters to the authenticated API with no-store', async () => {
    vi.mocked(api).mockResolvedValue({ canSend: true, amount: '123', shortfall: '0', readOnly: true });
    const response = await GET(new Request('https://easy-scraping.com/api/transfers/preview?recipientUserId=22222222-2222-4222-8222-222222222222&amount=123'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(api).toHaveBeenCalledWith('/api/v1/wallet/transfers/preview?recipientUserId=22222222-2222-4222-8222-222222222222&amount=123');
    expect(await response.json()).toMatchObject({ canSend: true, readOnly: true });
  });

  it('does not turn upstream 404, 401 or 503 into a successful empty preview', async () => {
    for (const status of [401, 404, 503]) {
      vi.mocked(api).mockRejectedValueOnce(new ApiError(status));
      const response = await GET(new Request('https://easy-scraping.com/api/transfers/preview?recipientUserId=22222222-2222-4222-8222-222222222222&amount=123'));
      expect(response.status).toBe(status);
      expect(response.headers.get('cache-control')).toContain('no-store');
      expect(await response.json()).not.toHaveProperty('canSend');
    }
  });

  it('rejects malformed and duplicate parameters without calling the API', async () => {
    for (const query of ['amount=01', 'amount=0', 'amount=1&amount=2', 'recipientUserId=x&amount=1']) {
      const response = await GET(new Request('https://easy-scraping.com/api/transfers/preview?' + query));
      expect(response.status).toBe(400);
    }
    expect(api).not.toHaveBeenCalled();
  });
});
