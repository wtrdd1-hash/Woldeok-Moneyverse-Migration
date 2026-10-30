import { describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService, WalletTransactionNotFoundError } from './wallet.service';

const URL = process.env.MV_A1355_TEST_DATABASE_URL;
const OWNER = '11111111-1111-4111-8111-111111111111';
const FOREIGN = '22222222-2222-4222-8222-222222222222';
const TX = '55555555-5555-4555-8555-555555555555';
const OTHER_TX = '66666666-6666-4666-8666-666666666666';
describe.skipIf(!URL)('wallet transaction detail disposable PostgreSQL proof', () => {
  it('reads frozen and closed owner pockets, exact WLD and UTC microseconds; hides foreign', async () => {
    const pool = new Pool({ connectionString: URL, connectionTimeoutMillis: 3000 });
    try {
      const repo = new PostgresWalletRepository(pool);
      const service = new WalletService(repo);
      const result = await service.transactionDetail(OWNER, TX);
      expect(result).toMatchObject({
        transactionId: TX,
        cashDelta: '-9007199254740993',
        bankDelta: '9007199254740993',
        netDelta: '0',
        currency: 'WLD',
        readStatus: 'READ_OK',
        reconciliationStatus: 'NOT_ASSESSED',
      });
      expect(result.occurredAtUtcMicros).toBe('2026-10-30T04:05:06.123456Z');
      await expect(service.transactionDetail(OWNER, OTHER_TX)).rejects.toBeInstanceOf(
        WalletTransactionNotFoundError,
      );
      await expect(service.transactionDetail(FOREIGN, TX)).rejects.toBeInstanceOf(
        WalletTransactionNotFoundError,
      );
      const { rows } = await pool.query(
        "SELECT has_table_privilege(current_user,'public.ledger_transactions','INSERT') AS can_write, has_table_privilege(current_user,'public.ledger_postings','UPDATE') AS can_update",
      );
      expect(rows[0]).toMatchObject({ can_write: false, can_update: false });
    } finally {
      await pool.end();
    }
  });
});
