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
    expect(query.mock.calls[0]![0]).toContain('admin_swf_snapshot');
    expect(query.mock.calls[0]![0]).toContain('$1::uuid');
    expect(query.mock.calls[0]![1]).toEqual([actor]);
    expect(query.mock.calls[0]![0]).not.toContain('FROM public.treasury_swf_');
  });
  it('returns HTTP 403 when the actor is denied by PostgreSQL (42501), without exposing portfolio data', async () => {
    const query = vi.fn().mockRejectedValue(Object.assign(new Error('admin role denied'), { code: '42501' }));
    const service = new AutoSovereignWealthFundService({ query } as unknown as Pool, {} as never);
    await expect(service.getAdminSnapshot(actor)).rejects.toMatchObject({ status: 403 });
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('fails closed if the database function returns no authorized snapshot', async () => {
    const service = new AutoSovereignWealthFundService({ query: vi.fn().mockResolvedValue({ rows: [] }) } as unknown as Pool, {} as never);
    await expect(service.getAdminSnapshot(actor)).rejects.toThrow();
  });
});


describe('admin treasury SWF controller actor-bound snapshot endpoint', () => {
  it('returns one actor-authorized snapshot without querying revoked base tables', async () => {
    const getAdminSnapshot = vi.fn().mockResolvedValue(snapshot);
    const getConfig = vi.fn(() => { throw Error('Unscoped config read forbidden'); });
    const getPortfolios = vi.fn(() => { throw Error('Unscoped portfolio read forbidden'); });
    const getRecentEvents = vi.fn(() => { throw Error('Unscoped event read forbidden'); });
    const controller = new AdminTreasuryController({} as never, {
      getAdminSnapshot, getConfig, getPortfolios, getRecentEvents,
    } as unknown as AutoSovereignWealthFundService);
    await expect(controller.getSwfStatus({ session: { user_id: actor } } as never)).resolves.toEqual(snapshot);
    expect(getAdminSnapshot).toHaveBeenCalledExactlyOnceWith(actor);
    expect(getConfig).not.toHaveBeenCalled();
    expect(getPortfolios).not.toHaveBeenCalled();
    expect(getRecentEvents).not.toHaveBeenCalled();
  });

  it('does not invent zero assets on DB authorization or evidence failure', async () => {
    const service = { getAdminSnapshot: vi.fn().mockRejectedValue(new Error('42501 denied')) };
    const controller = new AdminTreasuryController({} as never, service as never);
    await expect(controller.getSwfStatus({ session: { user_id: actor } } as never))
      .rejects.toThrow('42501 denied');
  });
});


describe('missing SWF service is unavailable, not verified empty', () => {
  it('responds 503 instead of inventing zero portfolios', async () => {
    const controller = new AdminTreasuryController({} as never, undefined);
    await expect(controller.getSwfStatus({ session: { user_id: actor } } as never))
      .rejects.toMatchObject({ status: 503 });
  });
});
