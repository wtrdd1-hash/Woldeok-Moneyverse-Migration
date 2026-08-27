import { randomUUID } from 'node:crypto';
import { Pool } from 'pg';
import { databaseUrl, isMissingGrant, rejectionOf } from '../testing/database';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

const DATABASE_URL = databaseUrl();

/**
 * These call the real money functions. They assert what the *database*
 * enforces, not what the service believes: a double can be made to agree with
 * a wrong SQL string, a live server cannot.
 */
describe.skipIf(!DATABASE_URL)('wallet against a real database', () => {
  let pool: Pool;
  let service: WalletService;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL, max: 2 });
    service = new WalletService(new PostgresWalletRepository(pool));
  });

  afterAll(async () => {
    await pool.end();
  });

  const UNKNOWN_USER = '00000000-0000-4000-8000-000000000000';

  // A member always has exactly one cash and one bank account, created with
  // the member. Their absence means the row set is wrong, not that the wallet
  // is empty, so the service refuses to invent a zero balance for a user who
  // has no accounts at all. Ported unchanged from the original.
  it('refuses to invent a wallet for a user with no accounts', async () => {
    await expect(service.overview(UNKNOWN_USER)).rejects.toThrow(
      'active cash and bank wallets are required',
    );
  });

  it('finds no loans for a user who has none', async () => {
    await expect(service.loans(UNKNOWN_USER)).resolves.toEqual([]);
  });

  it('rejects a transfer to a recipient that does not exist', async () => {
    await expect(
      service.transfer(UNKNOWN_USER, {
        recipientUserId: randomUUID(),
        amount: 1,
        idempotencyKey: randomUUID(),
      }),
    ).rejects.toThrow();
  });

  // Input validation happens before any query, so these must not depend on
  // the database having data.
  it('rejects a non-integer amount before touching the database', async () => {
    await expect(
      service.transfer(UNKNOWN_USER, {
        recipientUserId: UNKNOWN_USER,
        amount: 1.5 as unknown as number,
        idempotencyKey: randomUUID(),
      }),
    ).rejects.toThrow(/positive safe integer/);
  });

  it('rejects a negative amount', async () => {
    await expect(
      service.transfer(UNKNOWN_USER, {
        recipientUserId: UNKNOWN_USER,
        amount: -1,
        idempotencyKey: randomUUID(),
      }),
    ).rejects.toThrow(/positive safe integer/);
  });

  it('rejects a malformed idempotency key', async () => {
    await expect(
      service.transfer(UNKNOWN_USER, {
        recipientUserId: UNKNOWN_USER,
        amount: 1,
        idempotencyKey: 'not-a-uuid',
      }),
    ).rejects.toThrow(/UUID/);
  });

  // Every one of these reaches a real function; a signature that moved in a
  // migration surfaces here as an "does not exist" error rather than passing
  // silently against a double.
  it('calls bank_my_loans with the signature the migration declares', async () => {
    await expect(service.loans(UNKNOWN_USER)).resolves.toBeDefined();
  });

  it('calls the daily reward function and is refused for an unknown user', async () => {
    await expect(
      service.claimDaily(UNKNOWN_USER, { idempotencyKey: randomUUID() }),
    ).rejects.toThrow();
  });

  it('calls the work reward function and is refused for an unknown user', async () => {
    await expect(
      service.claimWork(UNKNOWN_USER, { idempotencyKey: randomUUID() }),
    ).rejects.toThrow();
  });

  it('calls the bank movement function and is refused for an unknown user', async () => {
    await expect(
      service.bankMove(UNKNOWN_USER, {
        direction: 'deposit',
        amount: 1,
        idempotencyKey: randomUUID(),
      }),
    ).rejects.toThrow();
  });

  it('calls the borrow function and is refused for an unknown user', async () => {
    await expect(
      service.borrow(UNKNOWN_USER, { principalAmount: 1, idempotencyKey: randomUUID() }),
    ).rejects.toThrow();
  });

  // The refusals above must come from the function's own checks, not from the
  // role lacking EXECUTE. A permission error would mean the deployment is
  // broken while these tests still looked like they passed.
  it('is refused by the functions themselves, never by a missing grant', async () => {
    const attempts = [
      () => service.claimDaily(UNKNOWN_USER, { idempotencyKey: randomUUID() }),
      () => service.claimWork(UNKNOWN_USER, { idempotencyKey: randomUUID() }),
      () =>
        service.bankMove(UNKNOWN_USER, {
          direction: 'deposit',
          amount: 1,
          idempotencyKey: randomUUID(),
        }),
      () => service.borrow(UNKNOWN_USER, { principalAmount: 1, idempotencyKey: randomUUID() }),
    ];
    for (const attempt of attempts) {
      const error = await rejectionOf(attempt);
      expect(isMissingGrant(error), 'the role lost a grant').toBe(false);
    }
  });
});
