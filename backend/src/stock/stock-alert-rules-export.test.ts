import type { QueryResultRow } from 'pg';
import { describe, expect, it } from 'vitest';
import { ConflictException } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { StockAlertRepository } from './stock-alert.repository';
import { StockAlertController } from './stock-alert.controller';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const OTHER = '00000000-0000-4000-8000-000000000002';

function repositoryFor(rows: readonly Record<string, unknown>[]) {
  const calls: { sql: string; values: readonly unknown[] }[] = [];
  const pool: Queryable = {
    async query<R extends QueryResultRow>(sql: string, values: readonly unknown[] = []) {
      calls.push({ sql, values });
      return { rows: rows as R[] };
    },
  };
  return { repository: new StockAlertRepository(pool), calls };
}

describe('private stock alert rule export', () => {
  it('reads only the session actor using the existing definer function and a 101-row overflow probe', async () => {
    const { repository, calls } = repositoryFor([]);
    await expect(repository.exportRules(ACTOR)).resolves.toEqual([]);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.sql).toContain('stock_alert_rules_list($1)');
    expect(calls[0]?.sql).toMatch(/LIMIT\s+101/i);
    expect(calls[0]?.values).toEqual([ACTOR]);
    await expect(repository.exportRules(OTHER)).resolves.toEqual([]);
    expect(calls[1]?.values).toEqual([OTHER]);
  });

  it('returns an exact 100-rule snapshot without client-selected actor or numeric coercion', async () => {
    const rows = Array.from({ length: 100 }, (_, index) => ({
      alert_id: String(index), threshold_amount: '9007199254740993', current_price: '9007199254740995',
    }));
    const { repository } = repositoryFor(rows);
    const controller = new StockAlertController(repository);
    const result = await controller.exportRules({ session: { user_id: ACTOR } } as never);
    expect(result.limit).toBe(100);
    expect(result.rules).toHaveLength(100);
    expect(result.rules[0]?.threshold_amount).toBe('9007199254740993');
  });

  it('returns only complete exports, never truncates a 101-rule snapshot', async () => {
    const { repository } = repositoryFor(Array.from({ length: 101 }, (_, index) => ({ alert_id: String(index) })));
    const controller = new StockAlertController(repository);
    await expect(controller.exportRules({ session: { user_id: ACTOR } } as never)).rejects.toBeInstanceOf(ConflictException);
  });
});
