import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

const URL = process.env.MV_WALLET_RECEIPT_TEST_DATABASE_URL;
const ACTOR = '11111111-1111-4111-8111-111111111111';
const OTHER = '33333333-3333-4333-8333-333333333333';
const KEY = '44444444-4444-4444-8444-444444444444';

describe.skipIf(!URL)('wallet transfer receipt: isolated real PostgreSQL least-privilege', () => {
  let pool: Pool;
  let service: WalletService;
  beforeAll(() => {
    pool = new Pool({ connectionString: URL, max: 2 });
    service = new WalletService(new PostgresWalletRepository(pool));
  });
  afterAll(async () => { await pool?.end(); });
  it('verifies exact large integer WLD and recipient from two ledger postings', async () => {
    await expect(service.transferReceipt(ACTOR, KEY)).resolves.toEqual({
      status: 'committed', transactionId: '55555555-5555-4555-8555-555555555555',
      recipientUserId: '22222222-2222-4222-8222-222222222222',
      amount: '9007199254740993', // > Number.MAX_SAFE_INTEGER but within PostgreSQL bigint
    });
  });
  it('never reveals another owner receipt even when the key is known', async () => {
    await expect(service.transferReceipt(OTHER, KEY)).resolves.toEqual({ status: 'unknown' });
    await expect(service.transferReceipt(ACTOR, '66666666-6666-4666-8666-666666666666'))
      .resolves.toEqual({ status: 'unknown' });
  });
  it('fails closed on incomplete ledger evidence', async () => {
    await expect(service.transferReceipt(ACTOR, '88888888-8888-4888-8888-888888888888'))
      .rejects.toThrow(/unverifiable/);
  });
  it('the reader role cannot mutate any ledger row', async () => {
    await expect(pool.query('UPDATE public.ledger_transactions SET type = type WHERE false'))
      .rejects.toMatchObject({ code: '42501' });
  });
});
