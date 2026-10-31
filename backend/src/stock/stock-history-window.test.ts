import { describe, expect, it, vi } from 'vitest';
import { StockController } from './stock.controller';
import { StockService, type StockRepository } from './stock.service';
import { PostgresStockRepository } from './stock.repository';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';

const USER = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: USER } } as RequestWithSession;

function controller() {
  const history = vi.fn(async (_userId: unknown, _limit?: unknown) => [{ trade_id: 't', gross_amount: '900719925474099312345' }]);
  const service = new StockService({ history } as unknown as StockRepository);
  return { controller: new StockController(service), history };
}

describe('owner-only stock trade history window', () => {
  it('keeps legacy 50 default and passes canonical 100/200 to owner service', async () => {
    const { controller: subject, history } = controller();
    await expect(subject.history(request)).resolves.toMatchObject({ trades: [{ gross_amount: '900719925474099312345' }] });
    await subject.history(request, '100');
    await subject.history(request, '200');
    expect(history.mock.calls.map((call) => call[1])).toEqual([50, 100, 200]);
    expect(history.mock.calls.every((call) => call[0] === USER)).toBe(true);
  });

  it.each(['0', '1', '201', '50.0', '050', '1e2', ' 100', '100 ', 'all', '', ['50', '200']])(
    'rejects noncanonical or repeated limit %s before DB', async (raw) => {
      const { controller: subject, history } = controller();
      await expect(subject.history(request, raw as string)).rejects.toMatchObject({ status: 400 });
      expect(history).not.toHaveBeenCalled();
    },
  );

  it('passes 200 as SQL function bound with actor and retains integer strings', async () => {
    const calls: { sql: string; values?: readonly unknown[] }[] = [];
    const pool: Queryable = {
      async query(sql, values) {
        calls.push({ sql, values });
        return { rows: [{ trade_id: 't', gross_amount: '900719925474099312345' }] };
      },
    };
    const rows = await new PostgresStockRepository(pool).history(USER, 200);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.sql).toContain('public.stock_my_trades($1,$2)');
    expect(calls[0]?.values).toEqual([USER, 200]);
    expect(rows[0]?.gross_amount).toBe('900719925474099312345');
  });
});

describe('member stock history minimum gross WLD', () => {
  it('filters exact integer strings inside the owner-scoped recent window', async () => {
    const history = vi.fn(async () => [
      { trade_id: 'a', gross_amount: '900719925474099312345' },
      { trade_id: 'b', gross_amount: '900719925474099312344' },
      { trade_id: 'c', gross_amount: '1' },
    ]);
    const subject = new StockController(new StockService({ history } as unknown as StockRepository));
    await expect(subject.history(request, '100', '900719925474099312345')).resolves.toEqual({
      trades: [{ trade_id: 'a', gross_amount: '900719925474099312345' }],
    });
    expect(history).toHaveBeenCalledWith(USER, 100);
  });

  it.each(['0', '-1', '01', '1.5', '1e3', ' 1', '', ['1', '2'], '9'.repeat(31)])(
    'rejects invalid, repeated or unsafe minimum gross %s before querying', async (raw) => {
      const { controller: subject, history } = controller();
      await expect(subject.history(request, '50', raw)).rejects.toMatchObject({ status: 400 });
      expect(history).not.toHaveBeenCalled();
    },
  );
});
