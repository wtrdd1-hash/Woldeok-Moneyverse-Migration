import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';

const OWNER = '11111111-1111-4111-8111-111111111111';
const TX = '55555555-5555-4555-8555-555555555555';
const SESSION = '33333333-3333-4333-8333-333333333333';
const good = {
  transaction_id: TX,
  transaction_type: 'BANK_DEPOSIT',
  occurred_at_utc_micros: '2026-10-30T04:05:06.123456Z',
  cash_delta: '-900719925474099312345',
  bank_delta: '900719925474099312345',
  net_delta: '0',
  currency: 'WLD',
  posting_count: '2',
  invalid_posting_count: '0',
};
afterEach(() => vi.unstubAllEnvs());

describe('owner-only wallet transaction detail', () => {
  it('queries a single owner WLD transaction without actor supplied by URL or direct DML', async () => {
    const query = vi.fn(async () => ({ rows: [good] }));
    const repo = new PostgresWalletRepository({ query } as unknown as Queryable);
    const result = await repo.transactionDetailForUser(OWNER, TX);
    expect(result).toEqual(good);
    const [sql, args] = query.mock.calls[0]!;
    expect(sql).toContain('account.owner_user_id = $1');
    expect(sql).toContain('ledger_transaction.id = $2');
    expect(sql).toContain('account.account_type IN');
    expect(sql).toContain('account.currency');
    expect(sql).toContain('HH24:MI:SS.US');
    expect(sql).not.toMatch(/\b(INSERT|UPDATE|DELETE|GRANT)\b/);
    expect(args).toEqual([OWNER, TX]);
  });

  it('returns canonical exact WLD and microsecond evidence without declaring settlement', async () => {
    const query = vi.fn(async () => ({ rows: [good] }));
    const service = new WalletService(
      new PostgresWalletRepository({ query } as unknown as Queryable),
    );
    const detail = await service.transactionDetail(OWNER, TX);
    expect(detail).toEqual({
      transactionId: TX,
      typeLabel: '은행 입금',
      occurredAtUtcMicros: '2026-10-30T04:05:06.123456Z',
      cashDelta: '-900719925474099312345',
      bankDelta: '900719925474099312345',
      netDelta: '0',
      currency: 'WLD',
      readStatus: 'READ_OK',
      reconciliationStatus: 'NOT_ASSESSED',
    });
  });

  it('does not disclose absent or foreign transactions and fails closed on corrupt projections', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const service = new WalletService(
      new PostgresWalletRepository({ query } as unknown as Queryable),
    );
    await expect(service.transactionDetail(OWNER, TX)).rejects.toMatchObject({
      name: 'WalletTransactionNotFoundError',
    });
    query.mockResolvedValueOnce({ rows: [{ ...good, net_delta: '1' }] });
    await expect(service.transactionDetail(OWNER, TX)).rejects.toThrow();
    query.mockResolvedValueOnce({ rows: [{ ...good, invalid_posting_count: '1' }] });
    await expect(service.transactionDetail(OWNER, TX)).rejects.toThrow();
    query.mockResolvedValueOnce({
      rows: [{ ...good, occurred_at_utc_micros: '2026-10-30T04:05:06.123Z' }],
    });
    await expect(service.transactionDetail(OWNER, TX)).rejects.toThrow();
    query.mockResolvedValueOnce({
      rows: [{ ...good, occurred_at_utc_micros: '2026-02-30T04:05:06.123456Z' }],
    });
    await expect(service.transactionDetail(OWNER, TX)).rejects.toThrow();
  });

  it('validates UUID and feature-off before any repository query', async () => {
    const transactionDetail = vi.fn(async () => good);
    const controller = new WalletController({ transactionDetail } as unknown as WalletService);
    const req = { session: { id: SESSION, user_id: OWNER } } as unknown as RequestWithSession;
    vi.stubEnv('WALLET_TRANSACTION_DETAIL_ENABLED', 'true');
    await expect(controller.transactionDetail(req, 'invalid')).rejects.toThrow();
    await expect(controller.transactionDetail(req, TX)).resolves.toEqual(good);
    expect(transactionDetail).toHaveBeenCalledWith(OWNER, TX);
    vi.stubEnv('WALLET_TRANSACTION_DETAIL_ENABLED', 'false');
    await expect(controller.transactionDetail(req, TX)).rejects.toThrow();
    expect(transactionDetail).toHaveBeenCalledTimes(1);
  });
});
