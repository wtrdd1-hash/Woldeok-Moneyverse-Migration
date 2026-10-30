import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class BankInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BankInputError';
  }
}

/** P0 #2070: no financial mutation before a DB-authoritative atomic fee quote exists. */
export class BankFeeContractUnavailableError extends Error {
  constructor() {
    super('bank pocket customization fee contract is not verified');
    this.name = 'BankFeeContractUnavailableError';
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

  /** Export a nonbinding owner-only read snapshot; the ledger is not reconciled by this read. */
  async getStandingSnapshot(actor: unknown): Promise<{
    currency: 'WLD'; cashBalance: string; depositBalance: string;
    unclaimedInterest: string; activeLoanOutstanding: string | null;
    observedAt: string; readOnly: true;
  }> {
    const value = await this.getStanding(actor);
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('bank standing unavailable');
    }
    const standing = value as Record<string, unknown>;
    const amount = (field: unknown): string => {
      if (typeof field !== 'string' || !/^(0|[1-9][0-9]{0,77})$/.test(field)) {
        throw new Error('invalid bank standing amount');
      }
      return field;
    };
    const loan = standing['active_loan'];
    if (loan !== null && loan !== undefined && (typeof loan !== 'object' || Array.isArray(loan))) {
      throw new Error('invalid active loan');
    }
    const outstanding = loan ? amount((loan as Record<string, unknown>)['outstanding_amount']) : null;
    return {
      currency: 'WLD',
      cashBalance: amount(standing['cash_balance']),
      depositBalance: amount(standing['bank_balance']),
      unclaimedInterest: amount(standing['unclaimed_interest']),
      activeLoanOutstanding: outstanding,
      observedAt: new Date().toISOString(),
      readOnly: true,
    };
  }

  /** Read-only, actor-scoped game credit signals; no synthetic activity or repayments. */
  async getCreditFacts(actor: unknown): Promise<{
    accountAgeDays: number;
    jobLevel: number;
    historicalRepaymentsCount: number;
    overdueRepaymentsCount: number;
  }> {
    assertUuid(actor, 'actor');
    const row = await queryOne<{
      account_age_days: number;
      job_level: number;
      repayment_count: number;
      overdue_count: number;
    }>(
      this.pool,
      `SELECT * FROM public.bank_my_credit_facts($1)`,
      [actor],
    );
    if (!row) throw new Error('credit profile unavailable');
    return {
      accountAgeDays: row.account_age_days,
      jobLevel: row.job_level,
      historicalRepaymentsCount: row.repayment_count,
      overdueRepaymentsCount: row.overdue_count,
    };
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

  /** Nonbinding estimate from one actor-scoped SQL snapshot; never queries a raw loan table. */
  async previewRepayment(actor: unknown, loanId: unknown, amountStr: unknown): Promise<{
    loanId: string;
    requestedAmount: string;
    payableAmount: string;
    cashBefore: string;
    cashAfter: string | null;
    debtBefore: string;
    debtAfter: string;
    adjustmentAmount: string;
    eligible: boolean;
    reason: 'ready' | 'insufficient_cash';
    observedAt: string;
    nonbinding: true;
  }> {
    assertUuid(actor, 'actor');
    assertUuid(loanId, 'loan id');
    if (typeof amountStr !== 'string' || !/^[1-9][0-9]{0,77}$/.test(amountStr)) {
      throw new BankInputError('amount must be a positive integer string (max 78 digits)');
    }
    const standingValue = await this.getStanding(actor);
    if (!standingValue || typeof standingValue !== 'object' || Array.isArray(standingValue)) {
      throw new BankInputError('active loan unavailable');
    }
    const standing = standingValue as Record<string, unknown>;
    const loanValue = standing['active_loan'];
    if (!loanValue || typeof loanValue !== 'object' || Array.isArray(loanValue)) {
      throw new BankInputError('active loan unavailable');
    }
    const loan = loanValue as Record<string, unknown>;
    if (loan['loan_id'] !== loanId || (loan['status'] !== 'active' && loan['status'] !== 'overdue')) {
      throw new BankInputError('active loan unavailable');
    }
    const cashRaw = standing['cash_balance'];
    const debtRaw = loan['outstanding_amount'];
    if (typeof cashRaw !== 'string' || !/^[0-9]{1,78}$/.test(cashRaw) ||
        typeof debtRaw !== 'string' || !/^[1-9][0-9]{0,77}$/.test(debtRaw)) {
      throw new Error('bank standing is invalid');
    }
    const cash = BigInt(cashRaw);
    const debt = BigInt(debtRaw);
    const requested = BigInt(amountStr);
    const payable = requested < debt ? requested : debt;
    const eligible = cash >= payable;
    return {
      loanId,
      requestedAmount: requested.toString(),
      payableAmount: payable.toString(),
      cashBefore: cash.toString(),
      cashAfter: eligible ? (cash - payable).toString() : null,
      debtBefore: debt.toString(),
      debtAfter: (debt - payable).toString(),
      adjustmentAmount: (requested - payable).toString(),
      eligible,
      reason: eligible ? 'ready' : 'insufficient_cash',
      observedAt: new Date().toISOString(),
      nonbinding: true,
    };
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

  // Pocket (Saving Pockets) Operations
  async listPockets(actor: unknown): Promise<unknown[]> {
    assertUuid(actor, 'actor');
    return queryRows(
      this.pool,
      `SELECT pocket_id::text, name, balance::text, target_amount::text,
              target_date, theme_color, icon_code, is_archived, created_at, updated_at
       FROM public.bank_list_pockets($1)`,
      [actor],
    );
  }

  async createPocket(
    actor: unknown,
    name: string,
    targetAmountStr?: string,
    targetDate?: string,
    themeColor?: string,
    iconCode?: string,
  ): Promise<unknown> {
    assertUuid(actor, 'actor');
    const targetAmount = targetAmountStr ? assertAmount(targetAmountStr, 'target amount').toString() : null;

    return queryOne(
      this.pool,
      `SELECT pocket_id::text, name, balance::text, target_amount::text,
              target_date, theme_color, icon_code, is_archived, created_at
       FROM public.bank_create_saving_pocket($1, $2, $3, $4, $5, $6)`,
      [actor, name, targetAmount, targetDate || null, themeColor || 'sky', iconCode || 'piggy-bank'],
    );
  }

  async transferPocket(
    key: unknown,
    actor: unknown,
    pocketId: unknown,
    direction: 'deposit' | 'withdraw',
    amountStr: unknown,
  ): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(pocketId, 'pocket id');
    const amount = assertAmount(amountStr, 'amount');

    return queryOne(
      this.pool,
      `SELECT pocket_id::text, pocket_name, new_pocket_balance::text,
              new_cash_balance::text, transfer_amount::text, direction
       FROM public.bank_transfer_pocket($1::uuid, $2::uuid, $3::uuid, $4::text, $5::bigint)`,
      [key, actor, pocketId, direction, amount.toString()],
    );
  }

  async customizePocket(
    key: unknown,
    actor: unknown,
    pocketId: unknown,
    _themeColor?: string,
    _iconCode?: string,
  ): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(pocketId, 'pocket id');

    // P0 #2070: UI advertises 100/300/400 WLD while the historical DEV
    // function always charges 100. No verified, atomic quote+charge contract
    // exists. Do not call any fee-bearing SQL until that contract is deployed
    // and independently tested. A feature flag must not bypass this hold.
    throw new BankFeeContractUnavailableError();
  }

  async archivePocket(key: unknown, actor: unknown, pocketId: unknown): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(pocketId, 'pocket id');

    return queryOne(
      this.pool,
      `SELECT pocket_id::text, returned_balance::text, cost_wld::text, new_cash_balance::text
       FROM public.bank_archive_pocket($1::uuid, $2::uuid, $3::uuid)`,
      [key, actor, pocketId],
    );
  }
}
