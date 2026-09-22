import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresStockRepository, StockInputError } from './stock.repository';

interface RecordedQuery {
  readonly text: string;
  readonly values: readonly unknown[] | undefined;
}

function recordingPool(rowsFor: (queryIndex: number, text: string) => Record<string, unknown>[]): {
  pool: Queryable;
  queries: RecordedQuery[];
} {
  const queries: RecordedQuery[] = [];
  const pool: Queryable = {
    async query(text: string, values?: readonly unknown[]) {
      const idx = queries.length;
      queries.push({ text, values });
      return { rows: rowsFor(idx, text) as never[] };
    },
  };
  return { pool, queries };
}

const ACTOR = '11111111-1111-4111-8111-111111111111';
const STOCK = '22222222-2222-4222-8222-222222222222';
const EVENT_KEY = '33333333-3333-4333-8333-333333333333';

describe('PostgresStockRepository.halt', () => {
  it('calls public.stock_halt_and_settle with actor, stock and event UUIDs', async () => {
    const { pool, queries } = recordingPool(() => [
      {
        settled_count: '5',
        total_refund_amount: '12500',
        quarantined_count: '0',
        halt_status: 'HALTED_SETTLED',
      },
    ]);

    const repo = new PostgresStockRepository(pool);
    const result = await repo.halt(ACTOR, STOCK, EVENT_KEY);

    expect(queries[0]?.text).toContain('public.stock_halt_and_settle($1, $2, $3)');
    expect(queries[0]?.values).toEqual([ACTOR, STOCK, EVENT_KEY]);
    expect(result).toEqual({
      settled_count: '5',
      total_refund_amount: '12500',
      quarantined_count: '0',
      halt_status: 'HALTED_SETTLED',
    });
  });

  it('rejects invalid UUIDs synchronously or via rejected promise', async () => {
    const { pool } = recordingPool(() => []);
    const repo = new PostgresStockRepository(pool);
    await expect(repo.halt('bad-actor', STOCK)).rejects.toThrow('must be a UUID');
    await expect(repo.halt(ACTOR, 'bad-stock')).rejects.toThrow('must be a UUID');
  });
});

describe('PostgresStockRepository.trade with halt check', () => {
  it('blocks buy or sell order when stock halt_status is not ACTIVE', async () => {
    const { pool } = recordingPool((_idx, text) => {
      if (text.includes('SELECT coalesce(halt_status')) {
        return [{ halt_status: 'HALTED_SETTLED', active: false }];
      }
      return [];
    });

    const repo = new PostgresStockRepository(pool);
    await expect(
      repo.trade({
        userId: ACTOR,
        stockId: STOCK,
        side: 'buy',
        quantity: 10,
      }),
    ).rejects.toThrow(StockInputError);
  });
});

describe('PostgresStockRepository.haltSettlementStatus', () => {
  it('returns settlement statistics including total refund amount and pending count', async () => {
    const { pool, queries } = recordingPool(() => [
      {
        stock_id: STOCK,
        symbol: 'WDX',
        name: '월덕 익스프레스',
        halt_status: 'HALTED_SETTLED',
        halted_at: '2026-09-21T00:00:00.000Z',
        settled_count: '12',
        total_refund_amount: '54000',
        quarantined_count: '0',
        pending_holdings_count: '0',
      },
    ]);

    const repo = new PostgresStockRepository(pool);
    const status = await repo.haltSettlementStatus(ACTOR, STOCK);

    expect(queries[0]?.text).toContain('public.stock_halt_settlement_status($1, $2)');
    expect(queries[0]?.values).toEqual([ACTOR, STOCK]);
    expect(status.symbol).toBe('WDX');
    expect(status.settled_count).toBe('12');
    expect(status.total_refund_amount).toBe('54000');
    expect(status.halt_status).toBe('HALTED_SETTLED');
  });
});

describe('PostgresStockRepository.haltSettlementReceipts', () => {
  it('queries user halt settlement receipts', async () => {
    const { pool, queries } = recordingPool(() => [
      {
        id: 'receipt-1',
        halt_event_id: EVENT_KEY,
        stock_id: STOCK,
        stock_symbol: 'WDX',
        stock_name: '월덕 익스프레스',
        quantity: '50',
        basis_method: 'average_cost',
        basis_unit_amount: '120',
        refund_amount: '6000',
        status: 'settled',
        created_at: new Date('2026-09-21T01:00:00.000Z'),
      },
    ]);

    const repo = new PostgresStockRepository(pool);
    const receipts = await repo.haltSettlementReceipts(ACTOR);

    expect(queries[0]?.text).toContain('public.virtual_stock_halt_settlements');
    expect(queries[0]?.values).toEqual([ACTOR]);
    expect(receipts).toHaveLength(1);
    expect(receipts[0]?.stock_symbol).toBe('WDX');
    expect(receipts[0]?.refund_amount).toBe('6000');
  });
});

describe('PostgresStockRepository.list with halt status visibility', () => {
  it('returns halt_status from stock_market_overview', async () => {
    const { pool, queries } = recordingPool(() => [
      {
        id: STOCK,
        symbol: 'WDX',
        name: '월덕 익스프레스',
        description: '가상 주식',
        current_price: '120',
        day_open_price: '110',
        day_high_price: '130',
        day_low_price: '105',
        shares_outstanding: '10000',
        shares_available: '8000',
        halt_status: 'HALTED_SETTLED',
        updated_at: new Date('2026-09-22T00:00:00.000Z'),
      },
    ]);

    const repo = new PostgresStockRepository(pool);
    const stocks = await repo.list();

    expect(queries[0]?.text).toContain('public.stock_market_overview()');
    expect(queries[0]?.text).toContain('halt_status');
    expect(stocks).toHaveLength(1);
    expect(stocks[0]?.halt_status).toBe('HALTED_SETTLED');
  });
});

