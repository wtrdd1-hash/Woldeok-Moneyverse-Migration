import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { parseWalletCalendarRange } from './wallet-calendar-range';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletActivityCursorExpired } from './wallet-activity-cursor';
import type { RequestWithSession } from '../auth/session.context';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const SESSION = '33333333-3333-4333-8333-333333333333';
const NOW = new Date('2026-10-30T04:00:00.000Z');
const row = (n: number) => ({
  transaction_id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`,
  type: 'USER_TO_USER',
  created_at: new Date('2026-10-29T00:00:00.123Z'),
  cursor_at: '2026-10-29T00:00:00.123456Z',
  net_amount: '900719925474099312345',
  cash_delta: '900719925474099312345',
  bank_delta: '0',
});
beforeEach(() =>
  vi.stubEnv('SESSION_SIGNING_KEY', 'test-only-secret-with-adequate-length-123456789'),
);
afterEach(() => vi.unstubAllEnvs());

describe('owner-only KST wallet calendar activity', () => {
  it('converts inclusive Korean calendar days to UTC half-open bounds', () => {
    expect(parseWalletCalendarRange('2026-10-28', '2026-10-30', NOW)).toEqual({
      from: '2026-10-28',
      to: '2026-10-30',
      since: new Date('2026-10-27T15:00:00.000Z'),
      before: new Date('2026-10-30T15:00:00.000Z'),
    });
    expect(parseWalletCalendarRange(undefined, undefined, NOW)).toBeNull();
  });
  it.each([
    ['0000-01-01', '0000-01-02'],
    ['2026-02-29', '2026-03-01'],
    ['2026-10-31', '2026-10-31'],
    ['2026-10-30', '2026-10-29'],
    ['2025-01-01', '2026-10-30'],
    ['2026-10-29', undefined],
    [undefined, '2026-10-29'],
    [['2026-10-29', '2026-10-30'], '2026-10-30'],
    ['2026-10-29%26x', '2026-10-30'],
  ])('rejects malformed, future, missing or overlong calendar bounds %s %s', (from, to) => {
    expect(() => parseWalletCalendarRange(from, to, NOW)).toThrow();
  });
  it('expires a signed range cursor after 15 minutes without querying PostgreSQL', async () => {
    const query = vi.fn(async () => ({ rows: Array.from({ length: 51 }, (_, i) => row(i + 1)) }));
    const repository = new PostgresWalletRepository({ query } as unknown as Queryable);
    const range = { from: '2026-10-28', to: '2026-10-30' };
    const first = await new WalletService(repository, { clock: () => NOW }).activityPage(
      ACTOR,
      SESSION,
      'all',
      undefined,
      'in',
      range,
    );
    query.mockClear();
    await expect(
      new WalletService(repository, {
        clock: () => new Date(NOW.getTime() + 900_001),
      }).activityPage(ACTOR, SESSION, 'all', first.nextCursor!, 'in', range),
    ).rejects.toBeInstanceOf(WalletActivityCursorExpired);
    expect(query).not.toHaveBeenCalled();
  });
  it('maps a stale 15-minute range cursor to HTTP 410 without leaking data', async () => {
    const controller = new WalletController({
      activityPage: async () => {
        throw new WalletActivityCursorExpired('wallet activity cursor expired');
      },
    } as unknown as WalletService);
    const request = { session: { id: SESSION, user_id: ACTOR } } as unknown as RequestWithSession;
    await expect(
      controller.activity(request, 'all', 'opaque', 'in', '2026-10-28', '2026-10-30'),
    ).rejects.toMatchObject({ status: 410 });
  });
  it('filters owner and KST upper bound before 51-row limit in SQL', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    await repo.activityTransactionsForUser(ACTOR, {
      asOf: NOW,
      since: new Date('2026-10-27T15:00:00.000Z'),
      before: new Date('2026-10-30T15:00:00.000Z'),
      after: { at: '2026-10-29T00:00:00.123456Z', id: row(1).transaction_id },
      direction: 'in',
    });
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain('ledger_transaction.created_at < $8::timestamptz');
    expect(sql.indexOf('ledger_transaction.created_at < $8::timestamptz')).toBeLessThan(
      sql.indexOf('LIMIT $7'),
    );
    expect(sql).toContain('cursor_at');
    expect(params[3]).toBe('2026-10-29T00:00:00.123456Z');
    expect(params[7]).toEqual(new Date('2026-10-30T15:00:00.000Z'));
  });
  it('signs microsecond cursor for the same owner, session, dates and direction only', async () => {
    const query = vi.fn(async () => ({ rows: Array.from({ length: 51 }, (_, i) => row(i + 1)) }));
    const service = new WalletService(
      new PostgresWalletRepository({ query } as unknown as Queryable),
      { clock: () => NOW },
    );
    const range = { from: '2026-10-28', to: '2026-10-30' };
    const first = await service.activityPage(ACTOR, SESSION, 'all', undefined, 'in', range);
    expect(first.transactions).toHaveLength(50);
    expect(first.nextCursor).toBeTruthy();
    query.mockClear();
    for (const bad of [
      () => service.activityPage(ACTOR, SESSION, 'all', first.nextCursor!, 'out', range),
      () =>
        service.activityPage(ACTOR, SESSION, 'all', first.nextCursor!, 'in', {
          from: '2026-10-29',
          to: '2026-10-30',
        }),
      () =>
        service.activityPage(
          '22222222-2222-4222-8222-222222222222',
          SESSION,
          'all',
          first.nextCursor!,
          'in',
          range,
        ),
      () =>
        service.activityPage(
          ACTOR,
          '22222222-2222-4222-8222-222222222222',
          'all',
          first.nextCursor!,
          'in',
          range,
        ),
    ])
      await expect(bad()).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
    query.mockResolvedValueOnce({ rows: [row(52)] });
    const next = await service.activityPage(ACTOR, SESSION, 'all', first.nextCursor!, 'in', range);
    expect(next.transactions).toHaveLength(1);
    expect(query.mock.calls[0]?.[1]?.[3]).toBe('2026-10-29T00:00:00.123456Z');
  });
});
