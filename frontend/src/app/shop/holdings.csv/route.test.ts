import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number) { super('API error'); }
  },
}));

import { GET } from './route';

const row = {
  catalog_id: '00000000-0000-4000-8000-000000000001',
  code: 'repair_kit', name: '수리 키트', category: 'utility',
  quantity: 2, acquired_at: '2026-10-25T07:00:00.000Z',
  expires_at: null, is_equipped: false, serial_number: null,
};

describe('owner-only shop holdings CSV BFF', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exports verified data with private, noindex and download headers', async () => {
    apiMock.mockResolvedValue({ holdings: [row] });
    const response = await GET();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/shop/holdings/export');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain('수리 키트');
  });

  it('does not generate empty success CSV on upstream outage', async () => {
    apiMock.mockRejectedValue(new Error('upstream offline'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('content-disposition')).toBeNull();
  });

  it('refuses incomplete upstream payloads instead of fabricating a zero inventory', async () => {
    apiMock.mockResolvedValue({ holdings: null });
    expect((await GET()).status).toBe(503);
  });
});
