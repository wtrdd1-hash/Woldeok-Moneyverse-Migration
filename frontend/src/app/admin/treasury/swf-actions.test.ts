import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, mutate, requireAdminConsole } = vi.hoisted(() => ({
  api: vi.fn(), mutate: vi.fn(), requireAdminConsole: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('@/lib/session', () => ({ requireAdminConsole }));

import {
  getSwfStatus, saveSwfGovernanceConfig, triggerSwfRebalance, liquidateSwfToTreasury,
} from './swf-actions';

describe('SWF elevated server actions', () => {
  beforeEach(() => { vi.resetAllMocks(); requireAdminConsole.mockResolvedValue({}); });

  it('reads private SWF data only after elevated administrator verification', async () => {
    api.mockResolvedValue({ config: { is_enabled: false }, portfolios: [], events: [] });
    expect(await getSwfStatus()).toEqual({ config: { is_enabled: false }, portfolios: [], events: [] });
    expect(requireAdminConsole).toHaveBeenCalledWith('/admin/treasury');
    expect(api).toHaveBeenCalledWith('/api/v1/admin/treasury/swf');
    requireAdminConsole.mockRejectedValue(new Error('locked'));
    await expect(getSwfStatus()).rejects.toThrow('locked');
    expect(api).toHaveBeenCalledTimes(1);
  });

  it('saves policy only via CSRF-aware mutate with a confirmed persisted configuration', async () => {
    const config = {
      is_enabled: false, reinvestment_ratio_pct: 15, max_investment_ratio_pct: 20,
      safe_reserve_wld: '25000000', max_single_investment_wld: '10000000',
    };
    mutate.mockResolvedValue({ ...config, id: 'current' });
    expect(await saveSwfGovernanceConfig(config)).toEqual({ ok: true });
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/treasury/swf/config', { method: 'PUT', body: config });
    mutate.mockResolvedValue({ ...config, is_enabled: true });
    await expect(saveSwfGovernanceConfig(config)).rejects.toThrow();
    expect(mutate).toHaveBeenCalledTimes(2);
  });

  it('refuses unsafe policy values before any backend write', async () => {
    await expect(saveSwfGovernanceConfig({
      is_enabled: true, reinvestment_ratio_pct: 150, max_investment_ratio_pct: 20,
      safe_reserve_wld: '25000000', max_single_investment_wld: '10000000',
    })).rejects.toThrow();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('distinguishes a no-op rebalance from a verified executed receipt', async () => {
    mutate.mockResolvedValueOnce({ executed: false, reason: 'SWF_CYCLE_LOCK_BUSY' });
    expect(await triggerSwfRebalance()).toEqual({ executed: false, reason: 'SWF_CYCLE_LOCK_BUSY' });
    mutate.mockResolvedValueOnce({ executed: true });
    await expect(triggerSwfRebalance()).rejects.toThrow();
    mutate.mockResolvedValueOnce({
      executed: true, totalAumWld: '100', taxCollectedWld: '1',
      harvestedWld: '2', reinvestedWld: '3',
    });
    expect((await triggerSwfRebalance()).executed).toBe(true);
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/treasury/swf/rebalance', { method: 'POST' });
  });

  it('refuses missing liquidation receipts and validates target amount', async () => {
    await expect(liquidateSwfToTreasury('1e9')).rejects.toThrow();
    expect(mutate).not.toHaveBeenCalled();
    mutate.mockResolvedValueOnce({ success: true });
    await expect(liquidateSwfToTreasury('20000000')).rejects.toThrow();
    mutate.mockResolvedValueOnce({
      success: true, liquidatedWld: '10', vaultCashAfter: '50', portfolioAfter: '20', totalAum: '70',
    });
    expect((await liquidateSwfToTreasury('20000000')).liquidatedWld).toBe('10');
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/treasury/swf/liquidate', {
      method: 'POST', body: { targetPortfolioAumWld: '20000000' },
    });
  });

  it('fails closed before mutations when the admin console is locked', async () => {
    requireAdminConsole.mockRejectedValue(new Error('locked'));
    await expect(triggerSwfRebalance()).rejects.toThrow('locked');
    expect(mutate).not.toHaveBeenCalled();
  });
});
