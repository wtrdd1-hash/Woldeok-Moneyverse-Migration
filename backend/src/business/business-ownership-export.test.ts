import { describe, expect, it, vi } from 'vitest';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import type { RequestWithSession } from '../auth/session.context';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const ownership = {
  ownershipId: other, businessTypeId: other, symbol: 'FARM', name: 'Farm', description: '',
  purchaseCost: '9007199254740993', dailyRevenue: '100', dailyOperatingCost: '20',
  purchasedAt: '2026-10-01T00:00:00.000Z', lastSettlementDate: null,
  isSettledToday: false, boostActive: null, status: 'active',
};
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

describe('owner-only virtual business snapshot API', () => {
  it('uses the session actor, returns exact strings and truthful bounded scope', async () => {
    const mineV2 = vi.fn(async () => [ownership]);
    const controller = new BusinessController({ mineV2 } as unknown as BusinessService);
    await expect(controller.ownershipExport(request)).resolves.toEqual({
      scope: 'current_100_max', businesses: [ownership],
    });
    expect(mineV2).toHaveBeenCalledExactlyOnceWith(ACTOR);
  });
  it('fails closed instead of silently truncating 101 owned businesses', async () => {
    const controller = new BusinessController({ mineV2: vi.fn(async () => Array.from({ length: 101 }, () => ownership)) } as unknown as BusinessService);
    await expect(controller.ownershipExport(request)).rejects.toMatchObject({ status: 503 });
  });
  it('never turns unavailable database results into a successful empty snapshot', async () => {
    const controller = new BusinessController({ mineV2: vi.fn(async () => { throw new Error('db down'); }) } as unknown as BusinessService);
    await expect(controller.ownershipExport(request)).rejects.toThrow();
  });
});

import { PostgresBusinessRepository } from './business.repository';
import type { Queryable } from '../core/db';

describe('business ownership database boundary', () => {
  it('reads only the SECURITY DEFINER owner function with a bound actor and date text', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresBusinessRepository({ query } as unknown as Queryable);
    await expect(repo.mineV2(ACTOR)).resolves.toEqual([]);
    expect(query).toHaveBeenCalledOnce();
    const [sql, args] = query.mock.calls[0] as unknown as [string, string[]];
    expect(sql).toContain('public.business_my_ownerships_v2($1)');
    expect(sql).toContain('last_settlement_date::text');
    expect(sql).not.toMatch(/FROM\s+public\.virtual_business_ownerships/i);
    expect(args).toEqual([ACTOR]);
  });
  it('rejects malformed actor before SQL execution', async () => {
    const query = vi.fn();
    const repo = new PostgresBusinessRepository({ query } as unknown as Queryable);
    await expect(repo.mineV2('not-an-actor')).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
});
