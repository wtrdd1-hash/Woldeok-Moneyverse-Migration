import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresStockRepository } from './stock.repository';

interface RecordedQuery {
  readonly text: string;
  readonly values: readonly unknown[] | undefined;
}

function recordingPool(rowsFor: () => Record<string, unknown>[]): {
  pool: Queryable;
  queries: RecordedQuery[];
} {
  const queries: RecordedQuery[] = [];
  const pool: Queryable = {
    async query(text: string, values?: readonly unknown[]) {
      queries.push({ text, values });
      return { rows: rowsFor() as never[] };
    },
  };
  return { pool, queries };
}

const ACTOR = '11111111-1111-4111-8111-111111111111';
const STOCK = '22222222-2222-4222-8222-222222222222';
const KEY = '33333333-3333-4333-8333-333333333333';

/**
 * The bounds the function enforces, enforced here first so a bad request is
 * a 400 rather than a 22023 translated back out. Every refusal below happens
 * before any query is sent.
 */
describe('PostgresStockRepository.publishMarketEvent', () => {
  const valid = {
    userId: ACTOR,
    stockId: STOCK,
    direction: 'up',
    strength: 2,
    hours: 6,
    headline: '뮤야얌 전자, 신제품 발표',
    body: '시장의 기대가 높다.',
    idempotencyKey: KEY,
  };

  it('passes the arguments in the order the function declares them', async () => {
    const { pool, queries } = recordingPool(() => [{ event_id: 'e', replayed: false }]);
    await new PostgresStockRepository(pool).publishMarketEvent(valid);
    expect(queries[0]?.text).toContain('public.stock_market_event_publish($1,$2,$3,$4,$5,$6,$7,$8,$9)');
    expect(queries[0]?.values).toEqual([
      KEY, ACTOR, STOCK, 'up', 2, 6, '뮤야얌 전자, 신제품 발표', '시장의 기대가 높다.', 'operator',
    ]);
  });

  it('sends null for the whole market', async () => {
    const { pool, queries } = recordingPool(() => [{ event_id: 'e', replayed: false }]);
    const { stockId: _stock, ...market } = valid;
    await new PostgresStockRepository(pool).publishMarketEvent(market);
    expect(queries[0]?.values?.[2]).toBeNull();
  });

  it.each([
    ['a sideways direction', { direction: 'sideways' }],
    ['a strength of four', { strength: 4 }],
    ['a strength of zero', { strength: 0 }],
    ['a fractional strength', { strength: 1.5 }],
    ['zero hours', { hours: 0 }],
    ['more than a week', { hours: 169 }],
    ['a one-character headline', { headline: 'x' }],
    ['a headline over 120 characters', { headline: 'x'.repeat(121) }],
    ['a body over 2000 characters', { body: 'x'.repeat(2001) }],
    ['an unknown source', { source: 'rumour' }],
    ['a stock id that is not a uuid', { stockId: 'MYUY' }],
  ])('refuses %s without querying', async (_label, override) => {
    const { pool, queries } = recordingPool(() => []);
    await expect(
      new PostgresStockRepository(pool).publishMarketEvent({ ...valid, ...override }),
    ).rejects.toThrow();
    expect(queries).toHaveLength(0);
  });

  it('trims the headline and body before sending them', async () => {
    const { pool, queries } = recordingPool(() => [{ event_id: 'e', replayed: false }]);
    await new PostgresStockRepository(pool).publishMarketEvent({
      ...valid,
      headline: '  호재  ',
      body: '  본문 ',
    });
    expect(queries[0]?.values?.[6]).toBe('호재');
    expect(queries[0]?.values?.[7]).toBe('본문');
  });

  it('fails loudly when the database returns no receipt', async () => {
    const { pool } = recordingPool(() => []);
    await expect(new PostgresStockRepository(pool).publishMarketEvent(valid)).rejects.toThrow(
      'did not return a market event receipt',
    );
  });
});

describe('PostgresStockRepository.cancelMarketEvent', () => {
  it('passes the key, the actor and the event', async () => {
    const { pool, queries } = recordingPool(() => [{ cancelled: true }]);
    await expect(
      new PostgresStockRepository(pool).cancelMarketEvent({
        userId: ACTOR,
        eventId: STOCK,
        idempotencyKey: KEY,
      }),
    ).resolves.toEqual({ cancelled: true });
    expect(queries[0]?.values).toEqual([KEY, ACTOR, STOCK]);
  });

  it('answers false rather than throwing when nothing came back', async () => {
    const { pool } = recordingPool(() => []);
    await expect(
      new PostgresStockRepository(pool).cancelMarketEvent({ userId: ACTOR, eventId: STOCK }),
    ).resolves.toEqual({ cancelled: false });
  });
});
