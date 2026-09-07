import type { Queryable } from '../core/db';
import { queryOne } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BankInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BankInputError';
  }
}

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID.test(value)) {
    throw new BankInputError(`${field} must be a UUID`);
  }
}

function assertAmount(value: unknown, field: string): bigint {
  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value)) {
    throw new BankInputError(`${field} must be a positive integer string`);
  }
  return BigInt(value);
}

export class BankRepository {
  constructor(private readonly pool: Queryable) {}

  async getStanding(actor: unknown): Promise<unknown> {
    assertUuid(actor, 'actor');
    const row = await queryOne<{ standing: unknown }>(
      this.pool,
      `SELECT public.bank_get_my_standing($1) AS standing`,
      [actor],
    );
    return row?.standing ?? null;
  }

  async moveBalance(
    key: unknown,
    actor: unknown,
    direction: 'deposit' | 'withdraw',
    amountStr: unknown,
  ): Promise<string> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    const amount = assertAmount(amountStr, 'amount');

    const row = await queryOne<{ tx_id: string }>(
      this.pool,
      `SELECT public.bank_move_balance($1, $2, $3, $4) AS tx_id`,
      [key, actor, direction, amount.toString()],
    );
    if (!row?.tx_id) throw new Error('database did not return a transaction id for bank transfer');
    return row.tx_id;
  }

  async claimCompoundInterest(key: unknown, actor: unknown): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');

    return queryOne(
      this.pool,
      `SELECT claimed_amount::text, new_bank_balance::text, transaction_id::text
       FROM public.bank_claim_compound_interest($1, $2)`,
      [actor, key],
    );
  }

  async borrowSmart(key: unknown, actor: unknown, amountStr: unknown): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    const amount = assertAmount(amountStr, 'amount');

    return queryOne(
      this.pool,
      `SELECT loan_id::text, principal_amount::text, interest_amount::text,
              outstanding_amount::text, transaction_id::text
       FROM public.bank_borrow($1, $2, $3)`,
      [key, actor, amount.toString()],
    );
  }

  async repayLoan(
    key: unknown,
    actor: unknown,
    loanId: unknown,
    amountStr: unknown,
  ): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(loanId, 'loan id');
    const amount = assertAmount(amountStr, 'amount');

    return queryOne(
      this.pool,
      `SELECT loan_id::text, paid_amount::text, outstanding_amount::text,
              transaction_id::text, replayed
       FROM public.bank_repay($1, $2, $3, $4)`,
      [key, actor, loanId, amount.toString()],
    );
  }

  async purchaseBond(
    key: unknown,
    actor: unknown,
    bondCode: string,
    amountStr: unknown,
  ): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    const amount = assertAmount(amountStr, 'amount');

    return queryOne(
      this.pool,
      `SELECT bond_id::text, bond_name, principal_amount::text,
              maturity_amount::text, maturity_at, transaction_id::text
       FROM public.bank_purchase_bond($1, $2, $3, $4)`,
      [actor, bondCode, amount.toString(), key],
    );
  }

  async redeemBond(key: unknown, actor: unknown, bondId: unknown): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(bondId, 'bond id');

    return queryOne(
      this.pool,
      `SELECT bond_id::text, maturity_amount::text, transaction_id::text
       FROM public.bank_redeem_bond($1, $2, $3)`,
      [actor, bondId, key],
    );
  }
}
