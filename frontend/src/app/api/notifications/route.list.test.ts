import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, api } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/api', () => ({ api }));
import { GET } from './route';

describe('verified notification BFF list', () => {
  beforeEach(() => { vi.resetAllMocks(); viewerOrUnknown.mockResolvedValue({ signedIn: true }); api.mockResolvedValue([]); });
  it('forwards a validated category and offset to the owner-scoped backend', async () => {
    const response = await GET(new Request('https://example.test/api/notifications?category=TRANSACTIONAL&offset=40&limit=20'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(api).toHaveBeenCalledWith('/api/v1/notifications?limit=20&offset=40&category=TRANSACTIONAL');
  });
  it('rejects invalid categories and negative offsets before any backend call', async () => {
    for (const q of ['category=NOT_REAL', 'offset=-1', 'offset=9999999999999999']) {
      expect((await GET(new Request('https://example.test/api/notifications?' + q))).status).toBe(400);
    }
    expect(api).not.toHaveBeenCalled();
  });
  it('forwards explicit unread filters for both browser and Android-compatible owner API', async () => {
    for (const value of ['true', 'false']) {
      const response = await GET(new Request('https://example.test/api/notifications?unreadOnly=' + value));
      expect(response.status).toBe(200);
      expect(api).toHaveBeenCalledWith('/api/v1/notifications?limit=50&offset=0&unreadOnly=' + value);
    }
  });
  it('rejects ambiguous repeated filter parameters without invoking the backend', async () => {
    for (const query of ['unreadOnly=true&unreadOnly=false', 'category=SYSTEM&category=TRANSACTIONAL', 'limit=20&limit=100']) {
      expect((await GET(new Request('https://example.test/api/notifications?' + query))).status).toBe(400);
    }
    expect(api).not.toHaveBeenCalled();
  });

});
