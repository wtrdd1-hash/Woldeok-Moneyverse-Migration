import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, mutateMock } = vi.hoisted(() => ({ apiMock: vi.fn(), mutateMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error { constructor(public status: number) { super('upstream unavailable'); } },
}));
vi.mock('@/lib/mutate', () => ({ mutate: mutateMock }));
vi.mock('@/lib/viewer', () => ({ currentViewer: vi.fn().mockResolvedValue({}), isAdministrator: vi.fn(() => true) }));
import { POST } from './route';

const request = (origin?: string, site = 'same-origin') => new Request('https://easy-scraping.com/api/admin/discord/test-dm', {
  method: 'POST',
  headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}), 'sec-fetch-site': site },
  body: JSON.stringify({ preset: 'whale' }),
});

describe('admin Discord DM test bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMock.mockImplementation(async (path: string) => path === '/api/v1/admin/security'
      ? { consoleSession: { state: 'open' } }
      : { csrfToken: 'test-token' });
    mutateMock.mockResolvedValue({ success: true, channelId: 'dm-123' });
  });

  it('rejects foreign origins before issuing any session token or DM', async () => {
    const response = await POST(request('https://evil.invalid'));
    expect(response.status).toBe(403);
    expect(apiMock).not.toHaveBeenCalled();
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('rejects missing origin and cross-site fetch metadata', async () => {
    expect((await POST(request())).status).toBe(403);
    expect((await POST(request('https://easy-scraping.com', 'cross-site'))).status).toBe(403);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('rejects locked admin console before DM', async () => {
    apiMock.mockResolvedValueOnce({ consoleSession: { state: 'idle_locked' } });
    expect((await POST(request('https://easy-scraping.com'))).status).toBe(403);
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('uses a server-bound CSRF mutation only after an open console', async () => {
    const response = await POST(request('https://easy-scraping.com'));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/admin/discord/test-dm', { method: 'POST', body: { preset: 'whale' } });
  });
});
