import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { authority, apiMock } = vi.hoisted(() => ({ authority: vi.fn(), apiMock: vi.fn() }));
vi.mock('@/lib/admin-seo-authority', () => ({
  verifySeoOperator: authority,
  seoResponse: (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } }),
}));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number) { super('API error'); }
  },
}));

import { GET } from './route';

describe('admin SEO status BFF', () => {
  beforeEach(() => { vi.clearAllMocks(); authority.mockResolvedValue(null); });

  it('does not fetch details when admin authority refuses', async () => {
    authority.mockResolvedValue(NextResponse.json({ error: 'forbidden' }, { status: 403 }));
    expect((await GET()).status).toBe(403);
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('reads the guarded backend path and returns private uncached data', async () => {
    apiMock.mockResolvedValue({ recentLogs: [{ path: '/example' }] });
    const response = await GET();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/seo/status/admin');
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect((await response.json()).recentLogs).toHaveLength(1);
  });

  it('fails closed on upstream errors', async () => {
    apiMock.mockRejectedValue(new Error('network'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).recentLogs).toBeUndefined();
  });
});