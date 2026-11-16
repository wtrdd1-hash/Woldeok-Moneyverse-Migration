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
