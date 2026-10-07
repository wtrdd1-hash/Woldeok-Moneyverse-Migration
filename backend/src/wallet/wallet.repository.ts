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
  readonly net_amount: string;
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

  async recentTransactionsForUser(userId: string, limit: number): Promise<WalletTransactionRow[]> {
    const ownerUserId = requireUuid(userId, 'authenticated user id');
    const recentLimit = requireRecentLimit(limit);
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
         ), 0)::text AS net_amount
       FROM public.ledger_transactions AS ledger_transaction
       JOIN public.ledger_postings AS posting ON posting.transaction_id = ledger_transaction.id
       JOIN public.accounts AS account ON account.id = posting.account_id
       WHERE account.owner_user_id = $1
         AND account.account_type IN (
           'USER_CASH'::public.account_type,
           'USER_BANK'::public.account_type
         )
       GROUP BY ledger_transaction.id, ledger_transaction.type, ledger_transaction.created_at
       ORDER BY ledger_transaction.created_at DESC, ledger_transaction.id DESC
       LIMIT $2`,
      [ownerUserId, recentLimit],
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

  async searchRecipients(query: string, currentUserId: string): Promise<{ userId: string; displayName: string }[]> {
    const q = (query || '').trim();
    if (!q) return [];
    return queryRows<{ userId: string; displayName: string }>(
      this.pool,
      `SELECT profile.user_id::text AS "userId", profile.display_name AS "displayName"
       FROM public.member_profiles AS profile
       JOIN public.users AS u ON u.id = profile.user_id
       WHERE profile.display_name ILIKE $1
         AND profile.user_id != $2::uuid
         AND u.status = 'active'::public.user_status
       LIMIT 10`,
      [`%${q}%`, currentUserId],
    );
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
    const senderName = sender?.display_name ?? '익명의 머니버스 시민';

    await queryOne(
      this.pool,
      `INSERT INTO public.in_app_notifications (user_id, category, title, body, link)
       VALUES ($1::uuid, 'TRANSACTIONAL', $2, $3, '/wallet')`,
      [
        data.receiverId,
        `💸 [P2P 송금] ${senderName}님으로부터 ${data.amount} WLD가 입금되었습니다!`,
        `${data.message ? `메모: "${data.message}"` : '안전하게 송금되었습니다.'} ${data.sticker ? `(스티커: ${data.sticker})` : ''}`,
      ],
    );
  }
}

