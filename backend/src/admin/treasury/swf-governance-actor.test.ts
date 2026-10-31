import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import { AdminTreasuryController } from './treasury.controller';

const actor = '11111111-1111-4111-8111-111111111111';
const newConfig = {
  id: 'current',
  is_enabled: false,
  safe_reserve_wld: '30000000',
  max_single_investment_wld: '5000000',
  reinvestment_ratio_pct: 10,
  max_investment_ratio_pct: 15,
};
const changes = {
  is_enabled: false,
  safe_reserve_wld: '30000000',
  max_single_investment_wld: '5000000',
  reinvestment_ratio_pct: 10,
  max_investment_ratio_pct: 15,
};

describe('SWF privileged audited governance, not direct app DML', () => {
  it('uses actor-bound SECURITY DEFINER policy update, not any base-table DML or fake receipt', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ config: newConfig }] });
    const connect = vi.fn();
    const service = new AutoSovereignWealthFundService({ query, connect } as unknown as Pool, {} as never);
    expect(await service.updateConfig(changes, actor)).toEqual(newConfig);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toContain('admin_swf_update_policy($1::uuid');
    expect(query.mock.calls[0]?.[0]).not.toContain('UPDATE public.treasury_swf_configs');
    expect(query.mock.calls[0]?.[0]).not.toContain('INSERT INTO public.treasury_swf_events');
    expect(query.mock.calls[0]?.[1]).toEqual([actor, JSON.stringify(changes)]);
    expect(connect).not.toHaveBeenCalled();
  });

  it('controller passes authenticated actor and refuses missing session or service', async () => {
    const updateConfig = vi.fn().mockResolvedValue(newConfig);
    const controller = new AdminTreasuryController({} as never, { updateConfig } as never);
    expect(await controller.updateSwfConfig({ session: { user_id: actor } } as never, changes)).toEqual(newConfig);
    expect(updateConfig).toHaveBeenCalledExactlyOnceWith(changes, actor);
    await expect(controller.updateSwfConfig({} as never, changes)).rejects.toThrow('guard order defect');
    expect(updateConfig).toHaveBeenCalledTimes(1);
    const missing = new AdminTreasuryController({} as never, undefined);
    await expect(missing.updateSwfConfig({ session: { user_id: actor } } as never, changes))
      .rejects.toMatchObject({ status: 503 });
  });

  it('fails closed when the database function has no authorized updated configuration', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ config: null }] });
    const service = new AutoSovereignWealthFundService({ query } as unknown as Pool, {} as never);
    await expect(service.updateConfig(changes, actor)).rejects.toMatchObject({ status: 503 });
  });
  it('maps actor permission and malformed policy to explicit 403/400', async () => {
    const query = vi.fn().mockRejectedValueOnce({ code: '42501' })
      .mockRejectedValueOnce({ code: '22023' });
    const service = new AutoSovereignWealthFundService({ query } as unknown as Pool, {} as never);
    await expect(service.updateConfig(changes, actor)).rejects.toMatchObject({
      status: 403, response: { code: 'SWF_GOVERNANCE_NOT_AUTHORIZED' },
    });
    await expect(service.updateConfig(changes, actor)).rejects.toMatchObject({
      status: 400, response: { code: 'SWF_GOVERNANCE_INVALID_POLICY' },
    });
    expect(query).toHaveBeenCalledTimes(2);
  });

});
