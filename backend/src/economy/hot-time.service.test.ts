import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { HotTimeService } from './hot-time.service';

describe('hot-time server evidence and mutation safety', () => {
  it('returns 503 when the DB pool is missing instead of reporting no active events', async () => {
    await expect(new HotTimeService(null).getActiveHotTimes()).rejects.toMatchObject({ status: 503 });
  });

  it('returns 503 on a database read error instead of reporting zero events', async () => {
    const query = vi.fn().mockRejectedValue(new Error('permission denied'));
    await expect(new HotTimeService({ query } as unknown as Queryable).getActiveHotTimes()).rejects.toMatchObject({ status: 503 });
  });

  it('requires the start window to have begun before reporting an active event', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const result = await new HotTimeService({ query } as unknown as Queryable).getActiveHotTimes();
    expect(result).toMatchObject({ hasActiveHotTime: false, activeBuffs: [] });
    expect(query.mock.calls[0][0]).toMatch(/starts_at\s*<=\s*NOW\(\)/i);
  });

  it('does not perform a direct table UPDATE without a verified DB privilege contract', async () => {
    const query = vi.fn();
    await expect(new HotTimeService({ query } as unknown as Queryable).toggleHotTime('WORK_SALARY_BOOST_150', true)).rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });
});
