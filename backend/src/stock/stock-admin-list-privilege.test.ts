import type { QueryResultRow } from 'pg';
import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresStockRepository } from './stock.repository';

const OPERATOR = '11111111-1111-4111-8111-111111111111';

describe('admin stock analytics SQL permission boundary', () => {
  it('reads only SECURITY DEFINER projections, never the revoked stock table', async () => {
    let query = '';
    let params: readonly unknown[] = [];
    const pool: Queryable = {
      async query<R extends QueryResultRow>(sql: string, values: readonly unknown[] = []) {
        query = sql;
        params = values;
        return { rows: [{ id: 'stock', symbol: 'EXACT', name: 'Exact', current_price: '9007199254740993',
          shares_outstanding: '2', shares_available: '2', holders: 0, trades: 0,
          active: true, halt_status: 'ACTIVE', halted_at: null }] as R[] };
      },
    };
    const rows = await new PostgresStockRepository(pool).adminList(OPERATOR);
    expect(params).toEqual([OPERATOR]);
    expect(query).toContain('public.stock_admin_list($1)');
    expect(query).toContain('public.stock_market_overview()');
    expect(query).not.toMatch(/(?:JOIN|FROM)\s+public\.virtual_stocks\b/i);
    expect(rows[0]?.current_price).toBe('9007199254740993');
    expect(rows[0]?.shares_outstanding).toBe('2');
  });
});
