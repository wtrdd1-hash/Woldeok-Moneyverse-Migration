import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { AdminNationalPensionController } from './national-pension.controller';
import { NationalPensionRepository } from './national-pension.repository';
import { NationalPensionService } from './national-pension.service';

const invalidQueryValues: unknown[] = [
  '0', '-1', '1.5', '2junk', '1e2', '101', '1000000',
  '9007199254740993', '', ' 2 ', '02', ['2', '3'], null, 2,
];

describe('P1 admin pension payout history query contract', () => {
  const getController = () => {
    const listRecentPayoutLogs = vi.fn().mockResolvedValue([]);
    const controller = new AdminNationalPensionController({ listRecentPayoutLogs } as unknown as NationalPensionService);
    return { controller, listRecentPayoutLogs };
  };

  it.each(invalidQueryValues)('rejects malformed limit %j before accessing financial records', async (value) => {
    const { controller, listRecentPayoutLogs } = getController();
    await expect(controller.getRecentPayouts(value as string)).rejects.toMatchObject({ status: 400 });
    expect(listRecentPayoutLogs).not.toHaveBeenCalled();
  });

  it.each([undefined, '1', '20', '100'])('accepts bounded limit %j', async (value) => {
    const { controller, listRecentPayoutLogs } = getController();
    await controller.getRecentPayouts(value);
    expect(listRecentPayoutLogs).toHaveBeenCalledWith(value === undefined ? 20 : Number(value));
  });
});

describe('P1 pension repository read boundary', () => {
  it.each([0, -1, 101, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid direct-call limit %s before any SQL', async (limit) => {
      const query = vi.fn();
      const repository = new NationalPensionRepository({ query } as unknown as Pool);
      await expect(repository.listRecentPayoutLogs(limit)).rejects.toMatchObject({ status: 400 });
      expect(query).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, 1, 20, 100])('passes bounded limit %j as SQL parameter', async (limit) => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new NationalPensionRepository({ query } as unknown as Pool);
    await repository.listRecentPayoutLogs(limit);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[1]).toEqual([limit === undefined ? 20 : limit]);
  });
});
