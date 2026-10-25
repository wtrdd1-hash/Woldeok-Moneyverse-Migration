import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(readonly status: number) { super('API error'); }
  },
}));
import { api } from '@/lib/api';
import { GET } from './route';

describe('private security event CSV route', () => {
  beforeEach(() => vi.mocked(api).mockReset());

  it('downloads verified member events with no-store and noindex', async () => {
    vi.mocked(api).mockResolvedValue({ events: [{ type: 'local_login_succeeded', createdAt: '2026-10-26T00:00:00.000Z' }], scope: 'recent-50' });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain('local_login_succeeded');
    expect(api).toHaveBeenCalledWith('/api/v1/account/security/events/export');
  });

  it('fails closed when the upstream payload is incomplete or invalid', async () => {
    vi.mocked(api).mockResolvedValue({ events: [{ type: '=FORMULA', createdAt: '2026-10-26T00:00:00.000Z' }] });
    expect((await GET()).status).toBe(502);
    vi.mocked(api).mockResolvedValue({ events: null });
    expect((await GET()).status).toBe(502);
  });
});
