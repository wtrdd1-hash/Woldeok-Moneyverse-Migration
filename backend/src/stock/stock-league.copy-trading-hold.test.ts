import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { StockLeagueController } from './stock-league.controller';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { StockLeagueRepository } from './stock-league.repository';

const followerId = '00000000-0000-4000-8000-000000000001';
const whaleId = '00000000-0000-4000-8000-000000000002';

const memberRequest = { session: { user_id: followerId } };

describe('stock league copy-trading financial integrity hold', () => {
  it('preserves session, authentication, consent, and CSRF guards on both mutations', () => {
    const required = [SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard];
    for (const method of ['subscribeCopyTrading', 'cancelCopyTrading'] as const) {
      const guards = Reflect.getMetadata(GUARDS_METADATA, StockLeagueController.prototype[method]);
      expect(guards).toEqual(required);
    }
  });

  it('rejects a valid subscribe request with 503 before invoking the repository', async () => {
    const subscribeCopyTrading = vi.fn().mockResolvedValue({ id: 'unsafe-success' });
    const controller = new StockLeagueController({ subscribeCopyTrading } as any);

    await expect(controller.subscribeCopyTrading(memberRequest as any, {
      whaleId,
      whaleName: 'Trader',
      allocatedBudget: 10000,
    })).rejects.toMatchObject({ status: 503 });
    expect(subscribeCopyTrading).not.toHaveBeenCalled();
  });

  it('rejects a direct repository subscribe call without any SQL or ledger side effect', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new StockLeagueRepository({ query } as any);

    await expect(repository.subscribeCopyTrading(followerId, 'Member', whaleId, 'Trader', 10000))
      .rejects.toThrow(/ledger-backed settlement/i);
    expect(query).not.toHaveBeenCalled();
  });

  it('cancels a legacy active subscription and updates the follower count in one atomic statement', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ cancelled: true }] });
    const repository = new StockLeagueRepository({ query } as any);

    expect(await repository.cancelCopyTrading(followerId, whaleId)).toBe(true);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0] as [string, string[]];
    expect(sql).toMatch(/WITH\s+cancelled\s+AS\s*\(/i);
    expect(sql).toMatch(/status\s*=\s*'active'/i);
    expect(sql).toMatch(/UPDATE\s+public\.stock_league_participants/i);
    expect(sql).toMatch(/SELECT\s+EXISTS\s*\(/i);
    expect(params).toEqual([followerId, whaleId]);
  });

  it('treats repeated cancellation as a no-op without decrementing a follower again', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ cancelled: false }] });
    const repository = new StockLeagueRepository({ query } as any);

    expect(await repository.cancelCopyTrading(followerId, whaleId)).toBe(false);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
