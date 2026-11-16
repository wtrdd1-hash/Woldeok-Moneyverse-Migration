import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ api: vi.fn(), requireAdminConsole: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: mocks.api }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: mocks.requireAdminConsole }));
import { fetchSystemLogsAction } from './actions';

describe('system log action authorization', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.requireAdminConsole.mockResolvedValue({ roles: ['superadmin'] }); });
  it('does not call backend when admin console verification fails', async () => {
    mocks.requireAdminConsole.mockRejectedValue(new Error('DENIED'));
    await expect(fetchSystemLogsAction('NGINX_ERROR', 100)).rejects.toThrow('DENIED');
    expect(mocks.api).not.toHaveBeenCalled();
  });
  it('requires admin console before every log request', async () => {
    mocks.api.mockResolvedValue({ status: 'EMPTY', lines: [] });
    await fetchSystemLogsAction('SPRING_BACKEND', 50);
    expect(mocks.requireAdminConsole).toHaveBeenCalledWith('/admin/logs/system');
    expect(mocks.api).toHaveBeenCalledOnce();
  });
  it('rejects open-console users who are not superadmin', async () => {
    mocks.requireAdminConsole.mockResolvedValue({ roles: ['admin'] });
    const result = await fetchSystemLogsAction('SPRING_BACKEND', 100);
    expect(result.success).toBe(false);
    expect(mocks.api).not.toHaveBeenCalled();
  });
  it('rejects unknown sources without contacting backend', async () => {
    const result = await fetchSystemLogsAction('../etc/passwd', 50);
    expect(result.success).toBe(false);
    expect(mocks.api).not.toHaveBeenCalled();
  });
});

import {
  fetchSystemLogHistoryAction,
  requestLogHistoryOtpAction,
  verifyLogHistoryOtpAction,
} from './actions';

describe('historical logs and OTP server action boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdminConsole.mockResolvedValue({ roles: ['SUPERADMIN'] });
  });

  const query = () => ({
    source: 'NGINX_ACCESS',
    classification: 'routine' as const,
    start: new Date(Date.now() - 3600000).toISOString(),
    end: new Date().toISOString(),
    filter: '',
    limit: 100,
  });

  it('denies non-superadmin without backend query', async () => {
    mocks.requireAdminConsole.mockResolvedValue({ roles: ['ADMIN'] });
    expect((await fetchSystemLogHistoryAction(query())).success).toBe(false);
    expect(mocks.api).not.toHaveBeenCalled();
  });

  it('denies forged path and oversized page without backend query', async () => {
    expect((await fetchSystemLogHistoryAction({ ...query(), source: '../../etc/passwd' })).success).toBe(false);
    expect((await fetchSystemLogHistoryAction({ ...query(), limit: 10000 })).success).toBe(false);
    expect(mocks.api).not.toHaveBeenCalled();
  });

  it('denies date windows beyond 30 days', async () => {
    const bad = {
      ...query(),
      start: new Date(Date.now() - 31 * 86400000).toISOString(),
    };
    expect((await fetchSystemLogHistoryAction(bad)).success).toBe(false);
    expect(mocks.api).not.toHaveBeenCalled();
  });

  it('requires verified session before contacting backend', async () => {
    mocks.requireAdminConsole.mockRejectedValue(new Error('CLOSED'));
    await expect(fetchSystemLogHistoryAction(query())).rejects.toThrow('CLOSED');
    expect(mocks.api).not.toHaveBeenCalled();
  });

  it('queries fixed-history API with no user-selected shell path', async () => {
    mocks.api.mockResolvedValue({
      status: 'EMPTY', source: 'NGINX_ACCESS', entries: [], totalCount: 0, nextCursor: null,
      classification: 'routine', timestamp: new Date().toISOString(),
    });
    expect((await fetchSystemLogHistoryAction(query())).success).toBe(true);
    expect(mocks.api).toHaveBeenCalledOnce();
    expect(mocks.api.mock.calls[0][0]).toMatch(/^\/api\/v1\/admin\/logs\/system\/history\?/);
  });

  it('requires a six-digit code before OTP verify and never returns code', async () => {
    expect((await verifyLogHistoryOtpAction('abc')).success).toBe(false);
    expect(mocks.api).not.toHaveBeenCalled();
    mocks.api.mockResolvedValue({ ok: true });
    expect((await requestLogHistoryOtpAction()).success).toBe(true);
    expect((await verifyLogHistoryOtpAction('123456')).success).toBe(true);
    expect(mocks.api.mock.calls[1][1]).toEqual({ method: 'POST', body: { otpCode: '123456' } });
  });
});
