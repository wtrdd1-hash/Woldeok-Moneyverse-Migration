import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiOrNull, viewerOrUnknown } = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  viewerOrUnknown: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
import { GET } from './route';

function request(query: string) {
  return new Request(`http://localhost/api/transfers/search?query=${encodeURIComponent(query)}`);
}

describe('wallet recipient search BFF privacy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    apiOrNull.mockResolvedValue([{ userId: 'a', displayName: '홍길동' }]);
  });

  it('does not call the backend for a signed-out visitor and is not cacheable', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const response = await GET(request('홍길'));
    expect(await response.json()).toEqual({ recipients: [] });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(apiOrNull).not.toHaveBeenCalled();
  });

  it('rejects one-character and overlong queries without backend calls', async () => {
    for (const query of ['홍', '%', 'a'.repeat(41)]) {
      const response = await GET(request(query));
      expect(await response.json()).toEqual({ recipients: [] });
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    }
    expect(apiOrNull).not.toHaveBeenCalled();
  });

  it('forwards a bounded Unicode search and never caches the owner-specific results', async () => {
    const response = await GET(request('홍길'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/wallet/recipients/search?query=%ED%99%8D%EA%B8%B8');
    expect((await response.json()).recipients).toHaveLength(1);
  });
});
