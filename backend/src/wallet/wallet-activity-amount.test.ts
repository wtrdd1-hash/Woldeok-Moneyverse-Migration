import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import type { RequestWithSession } from '../auth/session.context';
const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '33333333-3333-4333-8333-333333333333';
const NOW = new Date('2026-10-28T00:00:00.000Z');
const rows = Array.from({ length: 51 }, (_, i) => ({
  transaction_id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
  type: 'USER_TO_USER', created_at: new Date(NOW.getTime() - (i + 1) * 1000),
  net_amount: '-900719925474099312345', cash_delta: '-900719925474099312345', bank_delta: '0',
}));
beforeEach(() => vi.stubEnv('SESSION_SIGNING_KEY', 'wallet-amount-filter-test-key-adequate-length-12345'));
afterEach(() => vi.unstubAllEnvs());
describe('wallet absolute WLD activity floor', () => {
  it('filters exact absolute owner posting net with SQL HAVING before LIMIT, never JS post-filter', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    await repo.activityTransactionsForUser(OWNER, { asOf: NOW, since: null, minAmount: '900719925474099312345' });
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain('ABS(COALESCE(SUM(');
    expect(sql.indexOf('ABS(COALESCE(SUM(')).toBeLessThan(sql.indexOf('LIMIT $7'));
    expect(params).toContain('900719925474099312345');
    expect(params).not.toContain(Number('900719925474099312345'));
  });
  it('uses the ninth SQL parameter after an inclusive KST calendar end bound', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    const before = new Date('2026-10-29T00:00:00Z');
    await repo.activityTransactionsForUser(OWNER, { asOf: NOW, since: null, before, minAmount: '12345678901234567890' });
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('ledger_transaction.created_at < $8::timestamptz');
    expect(sql).toContain('>= $9::numeric');
    expect(params.slice(-2)).toEqual([before, '12345678901234567890']);
  });
  it('binds signed pagination to the amount floor and rejects different floor before SQL', async () => {
    const query = vi.fn(async () => ({ rows }));
    const service = new WalletService(new PostgresWalletRepository({ query } as unknown as Queryable), { clock: () => NOW });
    const first = await service.activityPage(OWNER, SESSION, 'all', undefined, 'all', undefined, '900719925474099312345');
    expect(first.hasMore).toBe(true);
    query.mockClear();
    await expect(service.activityPage(OWNER, SESSION, 'all', first.nextCursor!, 'all', undefined, '1')).rejects.toThrow();
    await expect(service.activityPage(OWNER, SESSION, 'all', first.nextCursor!)).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
  it('rejects noncanonical/unsafe WLD floors without any database call', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const service = new WalletService(new PostgresWalletRepository({ query } as unknown as Queryable), { clock: () => NOW });
    for (const amount of ['0', '01', '-1', '1.5', '1e3', '1&direction=out', '9'.repeat(31)]) {
      await expect(service.activityPage(OWNER, SESSION, 'all', undefined, 'all', undefined, amount)).rejects.toThrow();
    }
    expect(query).not.toHaveBeenCalled();
  });
  it('validates controller request before forwarding and keeps authenticated actor', async () => {
    const activityPage = vi.fn(async () => ({ transactions: [], hasMore: false, nextCursor: null, asOf: NOW.toISOString() }));
    const controller = new WalletController({ activityPage } as unknown as WalletService);
    const req = { session: { id: SESSION, user_id: OWNER } } as unknown as RequestWithSession;
    await controller.activity(req, '30d', undefined, 'out', undefined, undefined, '1000');
    expect(activityPage).toHaveBeenCalledWith(OWNER, SESSION, '30d', undefined, 'out', undefined, '1000');
    expect(() => controller.activity(req, 'all', undefined, 'all', undefined, undefined, ['1', '2'] as unknown as string)).toThrow();
  });
});
