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

describe('SEO daily digest proxy truth', () => {
  afterEach(() => vi.resetAllMocks());

  it('must never fabricate successful Discord dispatch on backend failure', async () => {
    vi.mocked(mutate).mockRejectedValue(new Error('backend unreachable'));
    const response = await POST();
    const json = await response.json();
    expect(response.status).toBe(503);
    expect(json.discordNotified).toBeUndefined();
    expect(json.error).toBeTruthy();
  });

  it('preserves an explicit unauthorized response', async () => {
    vi.mocked(mutate).mockRejectedValue(new ApiError(403, 'not authorized'));
    expect((await POST()).status).toBe(403);
  });

  it('uses session-preserving authenticated API for read and CSRF-backed mutation for write', async () => {
    vi.mocked(api).mockResolvedValueOnce({ message: 'none', discordNotified: false });
    vi.mocked(mutate).mockResolvedValueOnce({ message: 'delivered', discordNotified: true });
    expect((await GET()).status).toBe(200);
    expect((await POST()).status).toBe(200);
    expect(api).toHaveBeenCalledWith('/api/v1/seo/gsc/digest-report');
    expect(mutate).toHaveBeenCalledWith('/api/v1/seo/gsc/digest-report', {
      method: 'POST',
      body: {},
      timeoutMs: 60_000,
    });
  });
});
