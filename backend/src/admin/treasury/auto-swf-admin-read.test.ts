import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import { AdminTreasuryController } from './treasury.controller';

const actor = '11111111-1111-4111-8111-111111111111';
const snapshot = { config: { id: 'current', is_enabled: false, safe_reserve_wld: '9007199254740993' }, portfolios: [], events: [] };

describe('administrator SWF actor-scoped database read', () => {
  it('uses only a role-checked SECURITY DEFINER snapshot, not base-table SELECT', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ snapshot }] });
    const service = new AutoSovereignWealthFundService({ query } as unknown as Pool, {} as never);
    expect(await service.getAdminSnapshot(actor)).toEqual(snapshot);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]![0]).toContain('admin_swf_snapshot($1::uuid)');
    expect(query.mock.calls[0]![1]).toEqual([actor]);
    expect(query.mock.calls[0]![0]).not.toContain('FROM public.treasury_swf_');
  });
  it('returns 403 for an unauthorized actor rather than leaking SQL failure as 500', async () => {
    const service = new AutoSovereignWealthFundService({
      query: vi.fn().mockRejectedValue({ code: '42501' }),
    } as unknown as Pool, {} as never);
    await expect(service.getAdminSnapshot(actor)).rejects.toMatchObject({
      status: 403,
      response: { code: 'SWF_EVIDENCE_NOT_AUTHORIZED' },
    });
  });

  it('fails closed if the database function returns no authorized snapshot', async () => {
    const service = new AutoSovereignWealthFundService({ query: vi.fn().mockResolvedValue({ rows: [] }) } as unknown as Pool, {} as never);
    await expect(service.getAdminSnapshot(actor)).rejects.toThrow();
  });
  it('uses only the signed-in actor for SWF dashboard evidence, not raw finance SELECTs', async () => {
    const getAdminSnapshot = vi.fn().mockResolvedValue(snapshot);
    const getConfig = vi.fn().mockRejectedValue(new Error('raw table SELECT forbidden'));
    const getPortfolios = vi.fn().mockRejectedValue(new Error('raw table SELECT forbidden'));
    const getRecentEvents = vi.fn().mockRejectedValue(new Error('raw table SELECT forbidden'));
    const controller = new AdminTreasuryController({} as never, {
      getAdminSnapshot, getConfig, getPortfolios, getRecentEvents,
    } as unknown as AutoSovereignWealthFundService);
    expect(await controller.getSwfStatus({ session: { user_id: actor } } as never)).toEqual(snapshot);
    expect(getAdminSnapshot).toHaveBeenCalledExactlyOnceWith(actor);
    expect(getConfig).not.toHaveBeenCalled();
    expect(getPortfolios).not.toHaveBeenCalled();
    expect(getRecentEvents).not.toHaveBeenCalled();
    await expect(controller.getSwfStatus({} as never)).rejects.toThrow('guard order defect');
    expect(getAdminSnapshot).toHaveBeenCalledTimes(1);
  });

  it('fails closed when SWF snapshot dependency is unavailable', async () => {
    const controller = new AdminTreasuryController({} as never, undefined);
    await expect(controller.getSwfStatus({ session: { user_id: actor } } as never))
      .rejects.toMatchObject({ status: 503 });
  });

});
