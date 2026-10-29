import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { AutoSovereignWealthFundService } from './auto-swf.service';

const actor = '11111111-1111-4111-8111-111111111111';
const snapshot = { config: { id: 'current', is_enabled: false, safe_reserve_wld: '9007199254740993' }, portfolios: [], events: [] };

describe('administrator SWF actor-scoped database read', () => {
  it('uses only a role-checked SECURITY DEFINER snapshot, not base-table SELECT', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ snapshot }] });
    const service = new AutoSovereignWealthFundService({ query } as unknown as Pool, {} as never);
    expect(await service.getAdminSnapshot(actor)).toEqual(snapshot);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]![0]).toContain('admin_swf_snapshot');
    expect(query.mock.calls[0]![1]).toEqual([actor]);
    expect(query.mock.calls[0]![0]).not.toContain('FROM public.treasury_swf_');
  });
  it('fails closed if the database function returns no authorized snapshot', async () => {
    const service = new AutoSovereignWealthFundService({ query: vi.fn().mockResolvedValue({ rows: [] }) } as unknown as Pool, {} as never);
    await expect(service.getAdminSnapshot(actor)).rejects.toThrow();
  });
});
