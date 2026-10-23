import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, mutate, requireAdminConsole } = vi.hoisted(() => ({
  api: vi.fn(),
  mutate: vi.fn(),
  requireAdminConsole: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/mutate', () => ({ mutate, failure: () => ({ message: 'backend unavailable' }) }));
vi.mock('@/lib/session', () => ({ requireAdminConsole }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { harvestEnterpriseDividends, updateEnterpriseStatus } from './actions';

describe('enterprise administrator server actions', () => {
  beforeEach(() => { vi.resetAllMocks(); requireAdminConsole.mockResolvedValue({}); });

  it('requires admin console and server-only CSRF before treasury dividend harvesting', async () => {
    mutate.mockResolvedValue({ total_dividends_collected: '1200', enterprises_processed: 2, treasury_balance_after: '8000' });
    api.mockResolvedValue([{ id: 'verified-log' }]);
    const result = await harvestEnterpriseDividends();
    expect(result).toEqual({
      ok: true,
      receipt: { total_dividends_collected: '1200', enterprises_processed: 2, treasury_balance_after: '8000' },
      logs: [{ id: 'verified-log' }],
    });
    expect(requireAdminConsole).toHaveBeenCalledWith('/admin/enterprises');
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/enterprises/soes/harvest', { method: 'POST' });
    expect(api).toHaveBeenCalledWith('/api/v1/admin/enterprises/dividend-logs?limit=20');
  });

  it('does not invent dividend history when backend history cannot be read', async () => {
    mutate.mockResolvedValue({ total_dividends_collected: '0', enterprises_processed: 0, treasury_balance_after: '8000' });
    api.mockRejectedValue(new Error('history unavailable'));
    expect(await harvestEnterpriseDividends()).toEqual({
      ok: true,
      receipt: { total_dividends_collected: '0', enterprises_processed: 0, treasury_balance_after: '8000' },
      logs: null,
    });
  });

  it('rejects missing, malformed, or unsafe treasury receipts', async () => {
    mutate.mockResolvedValue({ total_dividends_collected: '1e9', enterprises_processed: 1, treasury_balance_after: '8000' });
    expect((await harvestEnterpriseDividends()).ok).toBe(false);
    mutate.mockResolvedValue({ total_dividends_collected: '1200', enterprises_processed: 1 });
    expect((await harvestEnterpriseDividends()).ok).toBe(false);
    mutate.mockRejectedValue(new Error('backend failed'));
    expect((await harvestEnterpriseDividends()).ok).toBe(false);
  });

  it('requires console and confirmed backend status for SOE changes', async () => {
    mutate.mockResolvedValue({ success: true, code: 'SOE_POWER', status: 'PAUSED' });
    expect(await updateEnterpriseStatus('SOE_POWER', 'PAUSED')).toEqual({ ok: true });
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/enterprises/soes/SOE_POWER', {
      method: 'PUT', body: { status: 'PAUSED' },
    });
    mutate.mockResolvedValue({ success: false, code: 'SOE_POWER', status: 'PAUSED' });
    expect((await updateEnterpriseStatus('SOE_POWER', 'PAUSED')).ok).toBe(false);
    mutate.mockResolvedValue({ success: true, code: 'SOE_OTHER', status: 'PAUSED' });
    expect((await updateEnterpriseStatus('SOE_POWER', 'PAUSED')).ok).toBe(false);
  });

  it('refuses invalid SOE input and unauthorized admin sessions without backend writes', async () => {
    expect((await updateEnterpriseStatus('SOE/../OTHER', 'ACTIVE')).ok).toBe(false);
    expect(mutate).not.toHaveBeenCalled();
    requireAdminConsole.mockRejectedValue(new Error('not admin'));
    await expect(harvestEnterpriseDividends()).rejects.toThrow('not admin');
    expect(mutate).not.toHaveBeenCalled();
  });
});
