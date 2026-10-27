import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error { constructor(readonly status: number) { super('unavailable'); } },
}));
import { api, ApiError } from '@/lib/api';
import { GET } from './route';

afterEach(() => { vi.resetAllMocks(); vi.unstubAllEnvs(); });
describe('public help verification same-origin route', () => {
  const url = 'https://example.org/api/help/verify?locale=en&slug=account-login';
  it('never calls backend when flag is OFF or path invalid', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'false');
    expect((await GET(new Request(url))).status).toBe(404);
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    expect((await GET(new Request(url.replace('account-login', '../admin')))).status).toBe(404);
    expect(api).not.toHaveBeenCalled();
  });
  it('returns only a no-store current publication receipt', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    vi.mocked(api).mockResolvedValue({ current: true, articleId: 'a1', publishedAt: '2026-10-27T06:00:00.000Z', reviewedUntil: '2026-10-28T06:00:00.000Z' });
    const response = await GET(new Request(url));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect((await response.json()).articleId).toBe('a1');
    expect(api).toHaveBeenCalledWith('/api/v1/help/articles/en/account-login/status', { timeoutMs: 5000 });
  });
  it('preserves a withdrawn article as 404 with no-store', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    vi.mocked(api).mockRejectedValue(new ApiError(404));
    const response = await GET(new Request(url));
    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect((await response.json()).current).toBe(false);
  });
  it('fails closed on backend failure', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1', 'true');
    vi.mocked(api).mockRejectedValue(new Error('offline'));
    const response = await GET(new Request(url));
    expect(response.status).toBe(503);
    expect((await response.json()).current).toBe(false);
  });
});
