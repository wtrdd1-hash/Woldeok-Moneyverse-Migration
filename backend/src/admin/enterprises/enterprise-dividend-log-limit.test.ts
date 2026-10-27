import { BadRequestException } from '@nestjs/common';
import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { AdminEnterpriseController } from './enterprise.controller';
import { EnterpriseRepository } from './enterprise.repository';
import type { EnterpriseService } from './enterprise.service';

const invalidQueryValues: unknown[] = [
  '', '0', '-1', '101', '2junk', '1e2', '1.5', ' 2', '+2',
  '9007199254740992', ['1', '2'], {}, null,
];

describe('P1 admin SOE dividend history limit contract', () => {
  it.each(invalidQueryValues)('rejects invalid HTTP limit %s before service access', async (value) => {
    const listRecentDividendLogs = vi.fn();
    const controller = new AdminEnterpriseController({
      listRecentDividendLogs,
    } as unknown as EnterpriseService);
    await expect(controller.listDividendLogs(value as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(listRecentDividendLogs).not.toHaveBeenCalled();
  });

  it.each([
    [undefined, 20],
    ['1', 1],
    ['20', 20],
    ['100', 100],
  ])('passes canonical HTTP limit %s as %i', async (input, expected) => {
    const listRecentDividendLogs = vi.fn().mockResolvedValue([]);
    const controller = new AdminEnterpriseController({
      listRecentDividendLogs,
    } as unknown as EnterpriseService);
    await expect(controller.listDividendLogs(input as never)).resolves.toEqual([]);
    expect(listRecentDividendLogs).toHaveBeenCalledExactlyOnceWith(expected);
  });

  it.each([0, -1, 101, 1.5, NaN, Infinity, -Infinity, 2 ** 53, '5', null])(
    'rejects invalid repository limit %s before any database query',
    async (limit) => {
      const query = vi.fn();
      const repository = new EnterpriseRepository({ query } as unknown as Pool);
      await expect(repository.listRecentDividendLogs(limit as number)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(query).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, 1, 20, 100])('queries with bounded limit %s', async (limit) => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new EnterpriseRepository({ query } as unknown as Pool);
    await expect(repository.listRecentDividendLogs(limit)).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[1]).toEqual([limit ?? 20]);
    expect(String(query.mock.calls[0]?.[0])).toContain('LIMIT $1');
  });
});
