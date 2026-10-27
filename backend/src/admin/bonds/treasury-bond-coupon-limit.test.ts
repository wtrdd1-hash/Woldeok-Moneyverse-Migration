import { BadRequestException } from '@nestjs/common';
import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { AdminTreasuryBondController } from './treasury-bond.controller';
import { TreasuryBondRepository } from './treasury-bond.repository';
import { TreasuryBondService } from './treasury-bond.service';

const INVALID = ['', '0', '-1', '101', '2junk', '1e2', '1.5', '+2', ' 2', '02', '9007199254740993'];

describe('admin bond coupon history pagination contract', () => {
  it('preserves default 20 and valid 1..100 decimal limits', async () => {
    const listRecentCouponLogs = vi.fn().mockResolvedValue([]);
    const controller = new AdminTreasuryBondController({ listRecentCouponLogs } as unknown as TreasuryBondService);
    for (const [raw, expected] of [[undefined, 20], ['1', 1], ['30', 30], ['100', 100]] as const) {
      await controller.listCouponLogs(raw);
      expect(listRecentCouponLogs).toHaveBeenLastCalledWith(expected);
    }
  });

  it.each(INVALID)('rejects invalid HTTP limit %j before service/database', async (raw) => {
    const listRecentCouponLogs = vi.fn().mockResolvedValue([]);
    const controller = new AdminTreasuryBondController({ listRecentCouponLogs } as unknown as TreasuryBondService);
    await expect(controller.listCouponLogs(raw)).rejects.toBeInstanceOf(BadRequestException);
    expect(listRecentCouponLogs).not.toHaveBeenCalled();
  });

  it('rejects repeated query parameters before service/database', async () => {
    const listRecentCouponLogs = vi.fn();
    const controller = new AdminTreasuryBondController({ listRecentCouponLogs } as unknown as TreasuryBondService);
    await expect(controller.listCouponLogs(['1', '2'] as unknown as string)).rejects.toBeInstanceOf(BadRequestException);
    expect(listRecentCouponLogs).not.toHaveBeenCalled();
  });

  it.each([0, -1, 101, 1.5, NaN, Infinity, -Infinity, 9007199254740992])('rejects unsafe repository limit %s before SQL', async (limit) => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new TreasuryBondRepository({ query } as unknown as Pool);
    await expect(repository.listRecentCouponLogs(limit)).rejects.toBeInstanceOf(BadRequestException);
    expect(query).not.toHaveBeenCalled();
  });

  it('uses a bound LIMIT and returns exact WLD strings without mutation', async () => {
    const rows = [{ id: 'coupon-1', amount_wld: '9007199254740993123456789' }];
    const query = vi.fn().mockResolvedValue({ rows });
    const repository = new TreasuryBondRepository({ query } as unknown as Pool);
    await expect(repository.listRecentCouponLogs(30)).resolves.toEqual(rows);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]?.[0]).toContain('LIMIT $1');
    expect(query.mock.calls[0]?.[1]).toEqual([30]);
  });
});
