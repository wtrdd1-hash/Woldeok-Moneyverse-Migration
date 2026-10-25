import { describe, expect, it } from 'vitest';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { StockLeagueController } from './stock-league.controller';
import { StockLeagueRepository } from './stock-league.repository';

class RejectUnexpectedSql {
  readonly statements: string[] = [];
  async query(sql: string) {
    this.statements.push(sql);
    throw new Error('COPY_TRADING_SQL_MUST_NOT_RUN');
  }
}

const request = { session: { user_id: '00000000-0000-4000-8000-000000000001' } } as unknown as RequestWithSession;
const whaleId = '00000000-0000-4000-8000-000000000002';
const subscribeBody = { whaleId, whaleName: '고래', allocatedBudget: 10000, copyRatio: 1 };

function assertUnavailable(error: unknown): boolean {
  expect(error).toMatchObject({
    status: 503,
    response: { code: 'COPY_TRADING_SETTLEMENT_UNAVAILABLE' },
  });
  return true;
}

describe('copy-trading ledger safety HOLD', () => {
  it('marks both financial mutation responses no-store', () => {
    for (const method of ['subscribeCopyTrading', 'cancelCopyTrading'] as const) {
      const headers = Reflect.getMetadata(HEADERS_METADATA, StockLeagueController.prototype[method]) as Array<{name: string; value: string}> | undefined;
      expect(headers).toEqual(expect.arrayContaining([{ name: 'Cache-Control', value: 'no-store' }]));
    }
  });

  it('rejects authenticated Nest subscribe requests without claiming an unescrowed budget', async () => {
    const db = new RejectUnexpectedSql();
    const controller = new StockLeagueController(new StockLeagueRepository(db as unknown as Queryable));
    await expect(controller.subscribeCopyTrading(request, subscribeBody)).rejects.toSatisfy(assertUnavailable);
    expect(db.statements).toEqual([]);
  });

  it('rejects authenticated Nest cancellation requests without unaudited state changes', async () => {
    const db = new RejectUnexpectedSql();
    const controller = new StockLeagueController(new StockLeagueRepository(db as unknown as Queryable));
    await expect(controller.cancelCopyTrading(request, { whaleId })).rejects.toSatisfy(assertUnavailable);
    expect(db.statements).toEqual([]);
  });

  it('rejects internal subscription calls before querying or changing PostgreSQL', async () => {
    const db = new RejectUnexpectedSql();
    const repo = new StockLeagueRepository(db as unknown as Queryable);
    await expect(repo.subscribeCopyTrading(request.session.user_id, '회원', whaleId, '고래', 10000)).rejects.toThrow('COPY_TRADING_SETTLEMENT_UNAVAILABLE');
    expect(db.statements).toEqual([]);
  });

  it('rejects internal cancellation calls before querying or changing PostgreSQL', async () => {
    const db = new RejectUnexpectedSql();
    const repo = new StockLeagueRepository(db as unknown as Queryable);
    await expect(repo.cancelCopyTrading(request.session.user_id, whaleId)).rejects.toThrow('COPY_TRADING_SETTLEMENT_UNAVAILABLE');
    expect(db.statements).toEqual([]);
  });
});
