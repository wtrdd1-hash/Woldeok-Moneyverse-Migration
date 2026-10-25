import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

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

  /** Read-only owner-scoped bank transfers proven by balanced ledger postings. */
  async recentMovements(actor: unknown, limit: number): Promise<{
    transactionId: string;
    type: 'BANK_DEPOSIT' | 'BANK_WITHDRAW';
    occurredAt: string;
    amountWld: string;
    cashDeltaWld: string;
    bankDeltaWld: string;
    verification: 'LEDGER_VERIFIED';
  }[]> {
    assertUuid(actor, 'actor');
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
      throw new BankInputError('limit must be an integer between 1 and 50');
    }
    const rows = await queryRows<{
      transaction_id: string;
      type: string;
      created_at: Date | string;
      cash_delta: string | null;
      bank_delta: string | null;
    }>(
      this.pool,
      `SELECT ledger_transaction.id::text AS transaction_id,
              ledger_transaction.type::text AS type,
              ledger_transaction.created_at,
              COALESCE(SUM(CASE WHEN account.account_type = 'USER_CASH'::public.account_type
                THEN CASE posting.direction WHEN 'debit'::public.posting_direction
                  THEN posting.amount ELSE -posting.amount END ELSE 0 END), 0)::text AS cash_delta,
              COALESCE(SUM(CASE WHEN account.account_type = 'USER_BANK'::public.account_type
                THEN CASE posting.direction WHEN 'debit'::public.posting_direction
                  THEN posting.amount ELSE -posting.amount END ELSE 0 END), 0)::text AS bank_delta
       FROM public.ledger_transactions AS ledger_transaction
       JOIN public.ledger_postings AS posting ON posting.transaction_id = ledger_transaction.id
       JOIN public.accounts AS account ON account.id = posting.account_id
       WHERE account.owner_user_id = $1
         AND account.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
         AND ledger_transaction.type IN ('BANK_DEPOSIT', 'BANK_WITHDRAW')
       GROUP BY ledger_transaction.id, ledger_transaction.type, ledger_transaction.created_at
       ORDER BY ledger_transaction.created_at DESC, ledger_transaction.id DESC
       LIMIT $2`,
      [actor, limit],
    );
    return rows.map((row) => {
      if (!UUID.test(row.transaction_id) ||
          (row.type !== 'BANK_DEPOSIT' && row.type !== 'BANK_WITHDRAW') ||
          typeof row.cash_delta !== 'string' || !/^-?(?:0|[1-9][0-9]*)$/.test(row.cash_delta) ||
          typeof row.bank_delta !== 'string' || !/^-?(?:0|[1-9][0-9]*)$/.test(row.bank_delta)) {
        throw new Error('bank ledger proof is incomplete');
      }
      const cash = BigInt(row.cash_delta);
      const bank = BigInt(row.bank_delta);
      if (cash + bank !== 0n ||
          (row.type === 'BANK_DEPOSIT' && (cash >= 0n || bank <= 0n)) ||
          (row.type === 'BANK_WITHDRAW' && (cash <= 0n || bank >= 0n))) {
        throw new Error('bank ledger proof is inconsistent');
      }
      const occurredAt = new Date(row.created_at);
      if (Number.isNaN(occurredAt.getTime())) throw new Error('bank ledger timestamp is invalid');
      return {
        transactionId: row.transaction_id,
        type: row.type,
        occurredAt: occurredAt.toISOString(),
        amountWld: (bank < 0n ? -bank : bank).toString(),
        cashDeltaWld: cash.toString(),
        bankDeltaWld: bank.toString(),
        verification: 'LEDGER_VERIFIED' as const,
      };
    });
  }

  async getStanding(actor: unknown): Promise<unknown> {
    assertUuid(actor, 'actor');
    const row = await queryOne<{ standing: unknown }>(
      this.pool,
      `SELECT public.bank_get_my_standing($1) AS standing`,
      [actor],
    );
    return row?.standing ?? null;
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
      `SELECT
         GREATEST(0, FLOOR(EXTRACT(EPOCH FROM (now() - u.created_at)) / 86400))::integer AS account_age_days,
         COALESCE((SELECT MAX(j.level) FROM public.user_job_progress j
                   WHERE j.user_id = u.id AND j.is_active), 0)::integer AS job_level,
         (SELECT COUNT(*)::integer FROM public.virtual_bank_loan_repayments r
          JOIN public.virtual_bank_loans l ON l.id = r.loan_id
          WHERE l.user_id = u.id) AS repayment_count,
         (SELECT COUNT(*)::integer FROM public.virtual_bank_loans l
          WHERE l.user_id = u.id AND (l.overdue_at IS NOT NULL OR l.status = 'overdue')) AS overdue_count
       FROM public.users u
       WHERE u.id = $1::uuid AND u.status = 'active'::public.user_status`,
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
       FROM public.bank_transfer_pocket($1, $2, $3, $4, $5)`,
      [key, actor, pocketId, direction, amount.toString()],
    );
  }

  async customizePocket(
    key: unknown,
    actor: unknown,
    pocketId: unknown,
    themeColor?: string,
    iconCode?: string,
  ): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(pocketId, 'pocket id');

    return queryOne(
      this.pool,
      `SELECT pocket_id::text, theme_color, icon_code, cost_wld::text, remaining_cash::text
       FROM public.bank_customize_pocket($1, $2, $3, $4, $5)`,
      [key, actor, pocketId, themeColor || 'sky', iconCode || 'piggy-bank'],
    );
  }

  async archivePocket(key: unknown, actor: unknown, pocketId: unknown): Promise<unknown> {
    assertUuid(key, 'idempotency key');
    assertUuid(actor, 'actor');
    assertUuid(pocketId, 'pocket id');

    return queryOne(
      this.pool,
      `SELECT pocket_id::text, returned_balance::text, cost_wld::text, new_cash_balance::text
       FROM public.bank_archive_pocket($1, $2, $3)`,
      [key, actor, pocketId],
    );
  }
}
