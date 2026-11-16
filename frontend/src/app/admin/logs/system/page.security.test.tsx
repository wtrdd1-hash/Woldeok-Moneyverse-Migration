import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  requireAdminConsole: vi.fn(),
  redirect: vi.fn((target: string) => { throw new Error(`REDIRECT:${target}`); }),
}));
vi.mock('@/lib/session', () => ({ requireAdminConsole: mocks.requireAdminConsole }));
vi.mock('@/lib/api', () => ({
  api: mocks.api,
  ApiError: class ApiError extends Error { constructor(readonly status: number) { super('unauthorized'); } },
}));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
import Page from './page';
import { ApiError } from '@/lib/api';

describe('admin runtime logs page session boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdminConsole.mockResolvedValue({ roles: ['superadmin'] });
    mocks.api.mockResolvedValue({ status: 'OK', lines: [] });
  });
  it('never renders an admin screen when Spring returns 401 despite a trusted gateway header', async () => {
    mocks.api.mockRejectedValue(new ApiError(401));
    await expect(Page()).rejects.toThrow('REDIRECT:/login?error=login_required');
    expect(mocks.redirect).toHaveBeenCalledWith('/login?error=login_required');
  });
  it('redirects on verified backend 403 instead of showing unavailable service', async () => {
    mocks.api.mockRejectedValue(new ApiError(403));
    await expect(Page()).rejects.toThrow('REDIRECT:/admin');
  });
  it('rejects ordinary admin roles before requesting logs', async () => {
    mocks.requireAdminConsole.mockResolvedValue({ roles: ['admin'] });
    await expect(Page()).rejects.toThrow('REDIRECT:/admin');
    expect(mocks.api).not.toHaveBeenCalled();
  });
});
