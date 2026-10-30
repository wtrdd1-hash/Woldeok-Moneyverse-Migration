import { Injectable } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class WalletInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletInputError';
  }
}

export function requireUuid(value: unknown, field: string): string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new WalletInputError(`${field} must be a UUID`);
  }
  return value.toLowerCase();
}

export function requirePositiveWld(value: unknown, field: string): string {
  if (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) return String(value);
  if (typeof value === 'string' && /^[1-9][0-9]*$/.test(value)) return value;
  throw new WalletInputError(`${field} must be a positive safe integer or canonical WLD integer string`);
}

export function requireRecentLimit(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1 || value > 50) {
    throw new WalletInputError('recent transaction limit must be an integer between 1 and 50');
  }
  return value;
}

/** accounts / account_balances columns: packages/database/init/001-economy-core.sql */
export interface WalletBalanceRow {
  readonly account_type: string;
  readonly available_amount: string;
  readonly updated_at: Date;
}

/** ledger_transactions / ledger_postings columns: packages/database/init/001-economy-core.sql */
export interface WalletTransactionRow {
  readonly transaction_id: string;
  readonly type: string;
  readonly created_at: Date;
  readonly cursor_at?: string;
  readonly net_amount: string;
  readonly cash_delta?: string;
  readonly bank_delta?: string;
}

/** Owner projection, read-only; a future numbered SECURITY DEFINER migration must
 * replace direct ledger SELECT after B's pending 307/308 migrations merge. */
export interface WalletTransactionDetailRow {
  readonly transaction_id: string;
  readonly transaction_type: string;
  readonly occurred_at_utc_micros: string;
  readonly cash_delta: string;
  readonly bank_delta: string;
  readonly net_delta: string;
  readonly currency: string;
  readonly posting_count: string;
  readonly invalid_posting_count: string;
}

/** public.wallet_active_recipient_by_id return column: packages/database/migrations/010-account-lifecycle.sql */
export interface WalletActiveRecipientRow {
  readonly user_id: string | null;
}

/** public.economy_transfer return column: packages/database/migrations/005-economy-hardening.sql */
export interface WalletTransferRow {
  readonly transaction_id: string;
}

/** public.economy_claim_daily / public.economy_claim_work RETURNS TABLE: packages/database/migrations/005-economy-hardening.sql, packages/database/migrations/021-work-reward.sql */
export interface WalletRewardRow {
  readonly transaction_id: string;
  readonly amount: string;
  readonly replayed: boolean;
}

/** public.wallet_reward_availability return columns: migration 108 */
export interface WalletRewardAvailabilityRow {
  readonly daily_available: boolean;
  readonly daily_next_eligible_at: Date | null;
  readonly work_available: boolean;
  readonly work_next_eligible_at: Date | null;
}

/** public.bank_move_balance RETURNS TABLE: packages/database/migrations/035-virtual-bank-loans.sql */
export interface WalletBankMoveRow {
  readonly transaction_id: string;
}

/** public.bank_my_loans RETURNS TABLE: packages/database/migrations/035-virtual-bank-loans.sql */
export interface WalletLoanRow {
  readonly loan_id: string;
  readonly principal_amount: string;
  readonly interest_amount: string;
  readonly outstanding_amount: string;
  readonly status: string;
  readonly issued_at: Date;
  readonly repaid_at: Date | null;
}

/** public.bank_borrow RETURNS TABLE: packages/database/migrations/035-virtual-bank-loans.sql */
export interface WalletBorrowRow {
  readonly loan_id: string;
  readonly principal_amount: string;
  readonly interest_amount: string;
  readonly outstanding_amount: string;
  readonly transaction_id: string;
  readonly replayed: boolean;
}

/** public.bank_repay RETURNS TABLE: packages/database/migrations/035-virtual-bank-loans.sql */
export interface WalletRepayRow {
  readonly loan_id: string;
  readonly paid_amount: string;
  readonly outstanding_amount: string;
  readonly transaction_id: string;
  readonly replayed: boolean;
}

/** Durable owner-scoped evidence; unknown does not mean safe to create a new key. */
export interface WalletTransferEvidenceRow {
  readonly transaction_id: string;
  readonly transaction_type: string;
  readonly postings: unknown;
}

export interface WalletTransferInput {
  readonly actorUserId: string;
  readonly recipientUserId: string;
  readonly amount: string;
  readonly idempotencyKey: string;
}

export interface WalletClaimDailyInput {
  readonly actorUserId: string;
  readonly idempotencyKey: string;
}

export interface WalletClaimWorkInput {
  readonly actorUserId: string;
  readonly idempotencyKey: string;
}

export interface WalletMoveBankBalanceInput {
  readonly actorUserId: string;
  readonly direction: unknown;
  readonly amount: string;
  readonly idempotencyKey: string;
}

export interface WalletBorrowInput {
  readonly actorUserId: string;
  readonly principalAmount: string;
  readonly idempotencyKey: string;
}

export interface WalletRepayInput {
  readonly actorUserId: string;
  readonly loanId: string;
  readonly amount: string;
  readonly idempotencyKey: string;
}

/**
 * Read-model and command gateway for a single wallet owner.
 *
 * This class intentionally has no ledger INSERT/UPDATE/DELETE path. Economic
 * changes are delegated to the two SECURITY DEFINER functions granted to the
 * application database role.
 */
@Injectable()
export class PostgresWalletRepository {
  readonly pool: Queryable;

  constructor(pool: Queryable) {
    if (!pool || typeof pool.query !== 'function')
      throw new TypeError('a PostgreSQL pool is required');
    this.pool = pool;
  }

  async transactionDetailForUser(userId: string, transactionId: string): Promise<WalletTransactionDetailRow | null> {
    const owner = requireUuid(userId, 'authenticated user id');
    const id = requireUuid(transactionId, 'transaction id');
    // One statement and one MVCC snapshot; group owner pocket legs before
    // projection. Do not derive a recipient or a settlement assertion.
    return queryOne<WalletTransactionDetailRow>(
      this.pool,
      `SELECT ledger_transaction.id::text AS transaction_id,
              ledger_transaction.type AS transaction_type,
              to_char(ledger_transaction.created_at AT TIME ZONE 'UTC',
                      'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS occurred_at_utc_micros,
              SUM(CASE WHEN account.account_type = 'USER_CASH'::public.account_type
                THEN CASE posting.direction WHEN 'debit'::public.posting_direction
                  THEN posting.amount::numeric ELSE -posting.amount::numeric END
                ELSE 0::numeric END)::text AS cash_delta,
              SUM(CASE WHEN account.account_type = 'USER_BANK'::public.account_type
                THEN CASE posting.direction WHEN 'debit'::public.posting_direction
                  THEN posting.amount::numeric ELSE -posting.amount::numeric END
                ELSE 0::numeric END)::text AS bank_delta,
              SUM(CASE posting.direction WHEN 'debit'::public.posting_direction
                THEN posting.amount::numeric ELSE -posting.amount::numeric END)::text AS net_delta,
              CASE WHEN COUNT(*) FILTER (WHERE account.currency <> 'WLD') = 0
                THEN 'WLD' ELSE 'INVALID' END AS currency,
              COUNT(*)::text AS posting_count,
              COUNT(*) FILTER (WHERE account.currency <> 'WLD')::text AS invalid_posting_count
       FROM public.ledger_transactions AS ledger_transaction
       JOIN public.ledger_postings AS posting ON posting.transaction_id = ledger_transaction.id
       JOIN public.accounts AS account ON account.id = posting.account_id
       WHERE account.owner_user_id = $1
         AND ledger_transaction.id = $2
         AND account.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
       GROUP BY ledger_transaction.id, ledger_transaction.type, ledger_transaction.created_at`,
      [owner, id],
    );
  }

  async balancesForUser(userId: string): Promise<WalletBalanceRow[]> {
    const ownerUserId = requireUuid(userId, 'authenticated user id');
    return queryRows<WalletBalanceRow>(
      this.pool,
      `SELECT
         account.account_type::text AS account_type,
         balance.available_amount::text AS available_amount,
         balance.updated_at
       FROM public.accounts AS account
       JOIN public.account_balances AS balance ON balance.account_id = account.id
       WHERE account.owner_user_id = $1
         AND account.status = 'active'::public.account_status
         AND account.account_type IN (
           'USER_CASH'::public.account_type,
           'USER_BANK'::public.account_type
         )
       ORDER BY account.account_type ASC`,
      [ownerUserId],
    );
  }

  async recentTransactionsForUser(userId: string, limit: number, periodDays?: number, direction?: 'in' | 'out' | 'neutral'): Promise<WalletTransactionRow[]> {
    const ownerUserId = requireUuid(userId, 'authenticated user id');
    const recentLimit = requireRecentLimit(limit);
    if (periodDays !== undefined && periodDays !== 7 && periodDays !== 30) {
      throw new WalletInputError('wallet activity period must be 7 or 30 days');
    }
    if (direction !== undefined && direction !== 'in' && direction !== 'out' && direction !== 'neutral') {
      throw new WalletInputError('wallet activity direction must be in, out or neutral');
    }
    return queryRows<WalletTransactionRow>(
      this.pool,
      `SELECT
         ledger_transaction.id::text AS transaction_id,
         ledger_transaction.type,
         ledger_transaction.created_at,
         COALESCE(SUM(
           CASE posting.direction
             WHEN 'debit'::public.posting_direction THEN posting.amount
             ELSE -posting.amount
           END
         ), 0)::text AS net_amount,
         COALESCE(SUM(
           CASE WHEN account.account_type = 'USER_CASH'::public.account_type THEN
             CASE posting.direction
               WHEN 'debit'::public.posting_direction THEN posting.amount
               ELSE -posting.amount
             END
           ELSE 0
           END
         ), 0)::text AS cash_delta,
         COALESCE(SUM(
           CASE WHEN account.account_type = 'USER_BANK'::public.account_type THEN
             CASE posting.direction
               WHEN 'debit'::public.posting_direction THEN posting.amount
               ELSE -posting.amount
             END
           ELSE 0
           END
         ), 0)::text AS bank_delta
       FROM public.ledger_transactions AS ledger_transaction
       JOIN public.ledger_postings AS posting ON posting.transaction_id = ledger_transaction.id
       JOIN public.accounts AS account ON account.id = posting.account_id
       WHERE account.owner_user_id = $1
         AND account.account_type IN (
           'USER_CASH'::public.account_type,
           'USER_BANK'::public.account_type
         )
         AND ($3::integer IS NULL OR ledger_transaction.created_at >= CURRENT_TIMESTAMP - ($3::integer * INTERVAL '1 day'))
       GROUP BY ledger_transaction.id, ledger_transaction.type, ledger_transaction.created_at
       HAVING ($4::text IS NULL OR SIGN(COALESCE(SUM(
         CASE posting.direction
           WHEN 'debit'::public.posting_direction THEN posting.amount
           ELSE -posting.amount
         END
       ), 0)) = CASE $4::text
         WHEN 'in' THEN 1
         WHEN 'out' THEN -1
         WHEN 'neutral' THEN 0
       END)
       ORDER BY ledger_transaction.created_at DESC, ledger_transaction.id DESC
       LIMIT $2`,
      [ownerUserId, recentLimit + 1, periodDays ?? null, direction ?? null],
    );
  }

  /** Owner-scoped keyset read. No ledger writes, new grants or unbounded OFFSET. */
  async activityTransactionsForUser(userId: string, options: {
    asOf: Date; since: Date | null; before?: Date; after?: { at: Date | string; id: string } | undefined;
    direction?: 'all' | 'in' | 'out' | 'neutral';
  }): Promise<WalletTransactionRow[]> {
    const owner = requireUuid(userId, 'authenticated user id');
    const afterId = options.after ? requireUuid(options.after.id, 'cursor transaction id') : null;
    if (options.direction !== undefined && !['all', 'in', 'out', 'neutral'].includes(options.direction)) {
      throw new WalletInputError('invalid wallet activity direction');
    }
    return queryRows<WalletTransactionRow>(
      this.pool,
      `SELECT ledger_transaction.id::text AS transaction_id,
         ledger_transaction.type, ledger_transaction.created_at,
         COALESCE(SUM(CASE posting.direction WHEN 'debit'::public.posting_direction THEN posting.amount ELSE -posting.amount END), 0)::text AS net_amount,
         COALESCE(SUM(CASE WHEN account.account_type = 'USER_CASH'::public.account_type THEN
           CASE posting.direction WHEN 'debit'::public.posting_direction THEN posting.amount ELSE -posting.amount END ELSE 0 END), 0)::text AS cash_delta,
         COALESCE(SUM(CASE WHEN account.account_type = 'USER_BANK'::public.account_type THEN
           CASE posting.direction WHEN 'debit'::public.posting_direction THEN posting.amount ELSE -posting.amount END ELSE 0 END), 0)::text AS bank_delta
       FROM public.ledger_transactions AS ledger_transaction
       JOIN public.ledger_postings AS posting ON posting.transaction_id = ledger_transaction.id
       JOIN public.accounts AS account ON account.id = posting.account_id
       WHERE account.owner_user_id = $1
         AND account.account_type IN ('USER_CASH'::public.account_type, 'USER_BANK'::public.account_type)
         AND ledger_transaction.created_at <= $2
         AND ($3::timestamptz IS NULL OR ledger_transaction.created_at >= $3)
         AND ($4::timestamptz IS NULL OR (ledger_transaction.created_at, ledger_transaction.id) < ($4, $5::uuid))
         ${options.before ? 'AND ledger_transaction.created_at < $8::timestamptz' : ''}
       GROUP BY ledger_transaction.id, ledger_transaction.type, ledger_transaction.created_at
       HAVING ($6::text IS NULL OR SIGN(COALESCE(SUM(
         CASE posting.direction WHEN 'debit'::public.posting_direction THEN posting.amount ELSE -posting.amount END
       ), 0)) = CASE $6::text WHEN 'in' THEN 1 WHEN 'out' THEN -1 WHEN 'neutral' THEN 0 END)
       ORDER BY ledger_transaction.created_at DESC, ledger_transaction.id DESC
       LIMIT $7`,
      [owner, options.asOf, options.since, options.after?.at ?? null, afterId,
        options.direction && options.direction !== 'all' ? options.direction : null, 51,
        ...(options.before ? [options.before] : [])],
    );
  }

  /**
   * Recipient resolution deliberately accepts only the internal user UUID.
   * It exposes neither OAuth subjects nor profile data, preventing this query
   * from becoming an identity lookup endpoint.
   */
  async activeRecipientById(recipientUserId: string): Promise<{ userId: string } | null> {
    const id = requireUuid(recipientUserId, 'recipient user id');
    const row = await queryOne<WalletActiveRecipientRow>(
      this.pool,
      'SELECT public.wallet_active_recipient_by_id($1)::text AS user_id',
      [id],
    );
    return row?.user_id ? { userId: requireUuid(row.user_id, 'database recipient user id') } : null;
  }

  async transferReceiptByKey(actorUserId: string, idempotencyKey: string): Promise<WalletTransferEvidenceRow | null> {
    const actor = requireUuid(actorUserId, 'authenticated user id');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    // Both predicates are mandatory: an idempotency key is not an authorization token.
    // The application already has SELECT on these ledger read-model tables;
    // this path never receives a write grant or mutates the financial ledger.
    return queryOne<WalletTransferEvidenceRow>(
      this.pool,
      `SELECT transaction_row.id::text AS transaction_id,
              transaction_row.type AS transaction_type,
              COALESCE((
                SELECT jsonb_agg(jsonb_build_object(
                  'ownerUserId', account.owner_user_id::text,
                  'accountType', account.account_type::text,
                  'direction', posting.direction::text,
                  'amount', posting.amount::text
                ) ORDER BY posting.id)
                FROM public.ledger_postings AS posting
                LEFT JOIN public.accounts AS account ON account.id = posting.account_id
                WHERE posting.transaction_id = transaction_row.id
              ), '[]'::jsonb) AS postings
       FROM public.ledger_transactions AS transaction_row
       WHERE transaction_row.idempotency_key = $1
         AND transaction_row.actor_user_id = $2`,
      [key, actor],
    );
  }

  async transfer({
    actorUserId,
    recipientUserId,
    amount,
    idempotencyKey,
  }: WalletTransferInput): Promise<{ transactionId: string }> {
    const actor = requireUuid(actorUserId, 'authenticated user id');
    const recipient = requireUuid(recipientUserId, 'recipient user id');
    const transferAmount = requirePositiveWld(amount, 'amount');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    if (actor === recipient) throw new WalletInputError('cannot transfer to yourself');

    const row = await queryOne<WalletTransferRow>(
      this.pool,
      'SELECT public.economy_transfer($1, $2, $3, $4::numeric)::text AS transaction_id',
      [key, actor, recipient, transferAmount],
    );
    if (!row?.transaction_id) throw new Error('database did not return a transfer receipt');
    return { transactionId: requireUuid(row.transaction_id, 'database transaction id') };
  }

  async claimDaily({ actorUserId, idempotencyKey }: WalletClaimDailyInput): Promise<WalletRewardRow> {
    const actor = requireUuid(actorUserId, 'authenticated user id');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    const row = await queryOne<WalletRewardRow>(
      this.pool,
      `SELECT transaction_id::text AS transaction_id, amount::text AS amount, replayed
       FROM public.economy_claim_daily($1, $2, public.server_game_day_key())`,
      [key, actor],
    );
    if (!row?.transaction_id) throw new Error('database did not return a daily-reward receipt');
    return row;
  }

  async claimWork({ actorUserId, idempotencyKey }: WalletClaimWorkInput): Promise<WalletRewardRow> {
    const actor = requireUuid(actorUserId, 'authenticated user id');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    const row = await queryOne<WalletRewardRow>(
      this.pool,
      `SELECT transaction_id::text AS transaction_id, amount::text AS amount, replayed
       FROM public.economy_claim_work($1, $2)`,
      [key, actor],
    );
    if (!row?.transaction_id) throw new Error('database did not return a work-reward receipt');
    return row;
  }

  async rewardAvailabilityForUser(userId: string): Promise<WalletRewardAvailabilityRow> {
    const actor = requireUuid(userId, 'authenticated user id');
    const row = await queryOne<WalletRewardAvailabilityRow>(
      this.pool,
      `SELECT daily_available, daily_next_eligible_at,
              work_available, work_next_eligible_at
       FROM public.wallet_reward_availability($1)`,
      [actor],
    );
    if (!row) throw new Error('database did not return reward availability');
    return row;
  }

  async moveBankBalance({
    actorUserId,
    direction,
    amount,
    idempotencyKey,
  }: WalletMoveBankBalanceInput): Promise<WalletBankMoveRow> {
    const actor = requireUuid(actorUserId, 'authenticated user id');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    const transferAmount = requirePositiveWld(amount, 'amount');
    if (direction !== 'deposit' && direction !== 'withdraw')
      throw new WalletInputError('invalid bank direction');
    const row = await queryOne<WalletBankMoveRow>(
      this.pool,
      'SELECT public.bank_move_balance($1,$2,$3,$4::numeric)::text AS transaction_id',
      [key, actor, direction, transferAmount],
    );
    if (!row?.transaction_id) throw new Error('database did not return a bank transfer receipt');
    return row;
  }

  async loansForUser(userId: string): Promise<WalletLoanRow[]> {
    const actor = requireUuid(userId, 'authenticated user id');
    return queryRows<WalletLoanRow>(
      this.pool,
      `SELECT loan_id::text, principal_amount::text, interest_amount::text, outstanding_amount::text, status, issued_at, repaid_at FROM public.bank_my_loans($1)`,
      [actor],
    );
  }

  async borrow({
    actorUserId,
    principalAmount,
    idempotencyKey,
  }: WalletBorrowInput): Promise<WalletBorrowRow> {
    const actor = requireUuid(actorUserId, 'authenticated user id');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    const principal = requirePositiveWld(principalAmount, 'principal amount');
    const row = await queryOne<WalletBorrowRow>(
      this.pool,
      `SELECT loan_id::text, principal_amount::text, interest_amount::text, outstanding_amount::text, transaction_id::text, replayed FROM public.bank_borrow($1,$2,$3::numeric)`,
      [key, actor, principal],
    );
    if (!row?.loan_id) throw new Error('database did not return a loan receipt');
    return row;
  }

  async repay({
    actorUserId,
    loanId,
    amount,
    idempotencyKey,
  }: WalletRepayInput): Promise<WalletRepayRow> {
    const actor = requireUuid(actorUserId, 'authenticated user id');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    const loan = requireUuid(loanId, 'loan id');
    const payment = requirePositiveWld(amount, 'amount');
    const row = await queryOne<WalletRepayRow>(
      this.pool,
      `SELECT loan_id::text, paid_amount::text, outstanding_amount::text, transaction_id::text, replayed FROM public.bank_repay($1,$2,$3,$4::numeric)`,
      [key, actor, loan, payment],
    );
    if (!row?.loan_id) throw new Error('database did not return a repayment receipt');
    return row;
  }

  async getCitizenTaxReceipt(userId: string): Promise<Record<string, unknown>> {
    const actor = requireUuid(userId, 'authenticated user id');
    const row = await queryOne<{ result: Record<string, unknown> }>(
      this.pool,
      `SELECT public.get_citizen_tax_transparency_receipt($1::uuid) AS result`,
      [actor],
    );
    return row?.result ?? {};
  }

  async voteCitizenBudget(userId: string, quarter: string, choice: string): Promise<{ success: boolean; quarter: string; choice: string }> {
    const actor = requireUuid(userId, 'authenticated user id');
    const row = await queryOne<{ success: boolean }>(
      this.pool,
      `SELECT public.treasury_cast_citizen_budget_vote($1::uuid, $2::text, $3::text) AS success`,
      [actor, quarter, choice],
    );
    if (row?.success !== true) throw new Error('database did not record treasury budget vote');
    return { success: true, quarter, choice };
  }

  async recordP2PTransfer(data: {
    senderId: string;
    receiverId: string;
    receiverName: string;
    amount: string;
    message?: string;
    sticker?: string;
  }): Promise<void> {
    await queryOne(
      this.pool,
      `INSERT INTO public.p2p_wire_transfers (sender_id, receiver_id, receiver_name, amount_wld, message, sticker)
       VALUES ($1::uuid, $2::uuid, $3, $4::numeric, $5, $6)`,
      [
        data.senderId,
        data.receiverId,
        data.receiverName,
        data.amount,
        data.message ?? null,
        data.sticker ?? null,
      ],
    );

    const sender = await queryOne<{ display_name: string }>(
      this.pool,
      `SELECT display_name FROM public.member_profiles WHERE user_id = $1::uuid`,
      [data.senderId],
    );
    const senderName = sender?.display_name ?? '?듬챸??癒몃땲踰꾩뒪 ?쒕?';

    await queryOne(
      this.pool,
      `INSERT INTO public.in_app_notifications (user_id, category, title, body, link)
       VALUES ($1::uuid, 'TRANSACTIONAL', $2, $3, '/wallet')`,
      [
        data.receiverId,
        `?뮯 [P2P ?↔툑] ${senderName}?섏쑝濡쒕???${data.amount} WLD媛 ?낃툑?섏뿀?듬땲??`,
        `${data.message ? `硫붾え: "${data.message}"` : '?덉쟾?섍쾶 ?↔툑?섏뿀?듬땲??'} ${data.sticker ? `(?ㅽ떚而? ${data.sticker})` : ''}`,
      ],
    );
  }
}


