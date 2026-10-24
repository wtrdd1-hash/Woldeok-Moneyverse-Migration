import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';

const { verifyOperator, apiMock } = vi.hoisted(() => ({ verifyOperator: vi.fn(), apiMock: vi.fn() }));
vi.mock('@/lib/admin-seo-authority', () => ({ verifySeoOperator: verifyOperator }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error { constructor(public status: number) { super('upstream'); } },
}));

import { GET } from './route';

describe('administrator health same-origin read bridge', () => {
  beforeEach(() => { vi.clearAllMocks(); verifyOperator.mockResolvedValue(null); });

  it('refuses locked consoles before reading telemetry', async () => {
    verifyOperator.mockResolvedValue(NextResponse.json({ error: 'console_locked' }, { status: 403 }));
    expect((await GET()).status).toBe(403);
    expect(apiMock).not.toHaveBeenCalled();
  });

  it('returns the measured upstream response with private no-store', async () => {
    apiMock.mockResolvedValue({ status: 'HEALTHY', dbLatencyMs: 4, serverTime: '2026-10-24T00:00:00Z' });
    const response = await GET();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/admin/api-health/status');
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect((await response.json()).dbLatencyMs).toBe(4);
  });

  it('returns unavailable rather than a healthy placeholder after upstream failure', async () => {
    apiMock.mockRejectedValue(new Error('unreachable'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect((await response.json()).status).not.toBe('HEALTHY');
  });
});
