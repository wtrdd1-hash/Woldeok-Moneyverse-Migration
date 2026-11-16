import { beforeEach, describe, expect, it, vi } from 'vitest';
const apiMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error {
    constructor(public status: number) { super('denied'); }
  },
}));
import { verifySeoOperator } from './admin-seo-authority';
import { ApiError } from '@/lib/api';

describe('SEO operator source of truth', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('cannot authorize a human from an internal service-token Spring console response alone', async () => {
    apiMock.mockImplementation(async (path: string) => {
      if (path === '/api/v1/admin/security') return { consoleSession: { state: 'open' } };
      if (path === '/api/v1/seo/status/admin') throw new ApiError(401);
    });
    const denied = await verifySeoOperator();
    expect(denied?.status).toBe(401);
    expect(apiMock).toHaveBeenCalledWith('/api/v1/seo/status/admin');
  });
  it('requires an actual Nest administrative console session and role', async () => {
    apiMock.mockImplementation(async (path: string) => path === '/api/v1/admin/security'
      ? { consoleSession: { state: 'open' } } : { recentLogs: [] });
    expect(await verifySeoOperator()).toBeNull();
    expect(apiMock).toHaveBeenCalledTimes(2);
  });
  it('fails closed when Nest administrator authority is offline', async () => {
    apiMock.mockImplementation(async (path: string) => path === '/api/v1/admin/security'
      ? { consoleSession: { state: 'open' } } : Promise.reject(new Error('SEO authority offline')));
    expect((await verifySeoOperator())?.status).toBe(503);
  });
});
