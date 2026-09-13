import type { QueryResultRow } from 'pg';
import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { StockAlertInputError, StockAlertRepository } from './stock-alert.repository';

function db(handler: (text: string, values: readonly unknown[]) => readonly Record<string, unknown>[]): Queryable {
  return {
    async query<R extends QueryResultRow>(text: string, values: readonly unknown[] = []) {
      return { rows: handler(text, values) as R[] };
    },
  };
}

const USER = '00000000-0000-4000-8000-000000000001';
const STOCK = '00000000-0000-4000-8000-000000000002';

describe('StockAlertRepository', () => {
  it('keeps price thresholds as integer strings', async () => {
    let observed: readonly unknown[] = [];
    const repository = new StockAlertRepository(db((_text, values) => {
      observed = values;
      return [{ alert_id: '00000000-0000-4000-8000-000000000003' }];
    }));
    await repository.create({
      userId: USER,
      stockId: STOCK,
      conditionKind: 'price_at_or_above',
      thresholdAmount: '9007199254740993',
      cooldownSeconds: 3600,
    });
    expect(observed[3]).toBe('9007199254740993');
    expect(observed[4]).toBeNull();
  });

  it('accepts signed day-change basis points and rejects mixed threshold units', async () => {
    const repository = new StockAlertRepository(db(() => [{ alert_id: '00000000-0000-4000-8000-000000000003' }]));
    await expect(repository.create({
      userId: USER,
      stockId: STOCK,
      conditionKind: 'day_change_at_or_below',
      thresholdBps: -500,
      cooldownSeconds: 600,
    })).resolves.toEqual({ alertId: '00000000-0000-4000-8000-000000000003' });
    await expect(repository.create({
      userId: USER,
      stockId: STOCK,
      conditionKind: 'day_change_at_or_above',
      thresholdBps: 500,
      thresholdAmount: '1000',
    })).rejects.toBeInstanceOf(StockAlertInputError);
  });

  it('bounds history reads and exposes the evaluator result', async () => {
    const calls: Array<readonly unknown[]> = [];
    const repository = new StockAlertRepository(db((text, values) => {
      calls.push(values);
      return text.includes('evaluate_due') ? [{ triggered: '2' }] : [];
    }));
    await repository.events(USER, 1000);
    await expect(repository.evaluateDue()).resolves.toBe(2);
    expect(calls[0]).toEqual([USER, 100]);
  });
});
