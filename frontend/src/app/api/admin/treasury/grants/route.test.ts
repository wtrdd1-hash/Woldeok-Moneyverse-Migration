import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, loadGrants } = vi.hoisted(() => ({
  api: vi.fn(),
  loadGrants: vi.fn(),
}));
vi.mock('@/lib/api', () => {
  class ApiError extends Error {
    constructor(public readonly status: number) { super('API error'); }
  }
  return { api, ApiError };
});
vi.mock('@/app/api/treasury/apply-grant/route', () => ({ loadGrants }));

import { ApiError } from '@/lib/api';
import { GET, POST } from './route';

describe('admin treasury grant hardening / v629', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    loadGrants.mockReturnValue([]);
  });

  it('rejects member without an admin role and does not read applications', async () => {
    api.mockRejectedValue(new ApiError(403));
    const response = await POST(new Request('http://localhost/api/admin/treasury/grants', { method: 'POST' }));
    expect(response.status).toBe(403);
    expect(loadGrants).not.toHaveBeenCalled();
  });

  it('rejects an elevated console that is not open', async () => {
    api.mockResolvedValue({ consoleSession: { state: 'idle_locked' } });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(loadGrants).not.toHaveBeenCalled();
  });

  it('allows only read access with an open admin session', async () => {
    api.mockResolvedValue({ consoleSession: { state: 'open' } });
    loadGrants.mockReturnValue([{ id: 'stored-application' }]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.json()).applications).toEqual([{ id: 'stored-application' }]);
  });

  it('does not approve or pay a grant even for an open admin session', async () => {
    api.mockResolvedValue({ consoleSession: { state: 'open' } });
    const response = await POST(new Request('http://localhost/api/admin/treasury/grants', {
      method: 'POST',
      body: JSON.stringify({ action: 'APPROVE', applicationId: 'example' }),
    }));
    expect(response.status).toBe(503);
    expect((await response.json()).ok).toBe(false);
    expect(loadGrants).not.toHaveBeenCalled();
  });
});
