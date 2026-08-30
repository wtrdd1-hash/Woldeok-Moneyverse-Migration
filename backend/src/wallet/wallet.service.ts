import { Injectable } from '@nestjs/common';
import type { WldAmount } from '@moneyverse/contract';
import { wldAmount } from '@moneyverse/contract';
import type {
  WalletBalanceRow,
  WalletBankMoveRow,
  WalletBorrowInput,
  WalletBorrowRow,
  WalletClaimDailyInput,
  WalletClaimWorkInput,
  WalletLoanRow,
  WalletMoveBankBalanceInput,
  WalletRepayInput,
  WalletRepayRow,
  WalletRewardRow,
  WalletTransactionRow,
  WalletTransferInput,
} from './wallet.repository';
import {
  PostgresWalletRepository,
  WalletInputError,
  requirePositiveSafeInteger,
  requireRecentLimit,
  requireUuid,
} from './wallet.repository';

const ACCOUNT_TYPES = new Set(['USER_CASH', 'USER_BANK']);
const TRANSACTION_LABELS: Readonly<Record<string, string>> = Object.freeze({
  MINT_TO_USER: '보상 지급',
  USER_TO_USER: '사용자 송금',
  USER_TO_TREASURY: '운영 수수료',
  TREASURY_TO_USER: '운영 지급',
  USER_TO_SINK: '소비',
  BANK_DEPOSIT: '은행 입금',
  BANK_WITHDRAW: '은행 출금',
  BANK_LOAN_ISSUED: '은행 대출',
  BANK_LOAN_REPAYMENT: '대출 상환',
  MARKET_ESCROW: '시장 예치',
  MARKET_SETTLEMENT: '시장 정산',
  ADMIN_ADJUSTMENT: '관리자 조정',
  WORK_REWARD: '작업 보상',
});

export class WalletRecipientError extends Error {
  constructor() {
    super('recipient is unavailable');
    this.name = 'WalletRecipientError';
  }
}

/**
 * The subset of the repository the service depends on. `PostgresWalletRepository`
 * satisfies this structurally; the constructor also accepts any object shaped
 * like it (see the runtime duck-typing check below, kept for callers outside
 * this module's static type checking).
 */
export interface WalletRepositoryLike {
  balancesForUser(userId: string): Promise<WalletBalanceRow[]>;
  recentTransactionsForUser(userId: string, limit: number): Promise<WalletTransactionRow[]>;
  activeRecipientById(recipientUserId: string): Promise<{ userId: string } | null>;
  transfer(input: WalletTransferInput): Promise<{ transactionId: string }>;
  claimDaily(input: WalletClaimDailyInput): Promise<WalletRewardRow>;
  claimWork(input: WalletClaimWorkInput): Promise<WalletRewardRow>;
  moveBankBalance(input: WalletMoveBankBalanceInput): Promise<WalletBankMoveRow>;
  loansForUser?(userId: string): Promise<WalletLoanRow[]>;
  borrow(input: WalletBorrowInput): Promise<WalletBorrowRow>;
  repay(input: WalletRepayInput): Promise<WalletRepayRow>;
}

export interface WalletBalanceView {
  readonly availableAmount: WldAmount;
  readonly updatedAt: string;
}

export interface WalletBalancesView {
  readonly currency: 'WLD';
  readonly cash: WalletBalanceView;
  readonly bank: WalletBalanceView;
  readonly totalAvailableAmount: WldAmount;
}

export type WalletTransactionDirection = 'in' | 'out' | 'neutral';

export interface WalletTransactionView {
  readonly transactionId: string;
  readonly type: string;
  readonly label: string;
  readonly netAmount: WldAmount;
  readonly direction: WalletTransactionDirection;
  readonly occurredAt: string;
}

export interface WalletOverview {
  /**
   * The caller's own Moneyverse id, which is what another member types to
   * send them WLD. The original wallet page displayed it beside a copy
   * control, and it belongs here rather than on the session route: this is
   * the caller's wallet, and the id *is* the wallet's name.
   */
  readonly userId: string;
  readonly balances: WalletBalancesView;
  readonly recentTransactions: WalletTransactionView[];
}

export interface WalletTransferReceipt {
  readonly transactionId: string;
}

export interface WalletRewardReceipt {
  readonly transactionId: string;
  readonly amount: WldAmount;
  readonly replayed: boolean;
}

/**
 * 076 gave a loan a third status. `overdue` is not a failure to report: it is
 * the state the maturity sweep puts a loan into, the borrower can still repay
 * it, and the screen has to be able to tell it apart from `active`.
 */
export type WalletLoanStatus = 'active' | 'repaid' | 'overdue';

export interface WalletLoanView {
  readonly loanId: string;
  readonly principalAmount: WldAmount;
  readonly interestAmount: WldAmount;
  readonly outstandingAmount: WldAmount;
  readonly status: WalletLoanStatus;
  readonly issuedAt: string;
  readonly repaidAt: string | null;
}

export interface WalletBorrowReceipt {
  readonly loanId: string;
  readonly principalAmount: WldAmount;
  readonly interestAmount: WldAmount;
  readonly outstandingAmount: WldAmount;
  readonly replayed: boolean;
}

export interface WalletRepayReceipt {
  readonly loanId: string;
  readonly paidAmount: WldAmount;
  readonly outstandingAmount: WldAmount;
  readonly replayed: boolean;
}

export interface WalletOverviewOptions {
  readonly recentLimit?: number;
}

export interface WalletTransferRequest {
  readonly recipientUserId?: unknown;
  readonly amount?: unknown;
  readonly idempotencyKey?: unknown;
}

export interface WalletClaimRequest {
  readonly idempotencyKey?: unknown;
}

export interface WalletBankMoveRequest {
  readonly direction?: unknown;
  readonly amount?: unknown;
  readonly idempotencyKey?: unknown;
}

export interface WalletBorrowRequest {
  readonly principalAmount?: unknown;
  readonly idempotencyKey?: unknown;
}

export interface WalletRepayRequest {
  readonly loanId?: unknown;
  readonly amount?: unknown;
  readonly idempotencyKey?: unknown;
}

/**
 * Validates a database-sourced integer amount as an already-canonical
 * `WldAmount`, then additionally requires it to be strictly positive. Row
 * types are assertions about the schema, not proofs, so this runs even
 * though the row interfaces already declare the field as `string`.
 */
function positiveWldAmount(value: string, field: string): WldAmount {
  const amount = wldAmount(value, field);
  if (BigInt(amount) <= 0n) throw new Error(`database returned an invalid ${field}`);
  return amount;
}

function timestamp(value: Date | string, field: string): string {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.valueOf())) throw new Error(`database returned an invalid ${field}`);
  return parsed.toISOString();
}

/**
 * Until this accepted `overdue`, the first loan the maturity sweep marked
 * turned the whole of GET /bank/loans into a 500 for that member -- the list,
 * not the one row. The throw is kept for a value the table's own CHECK
 * constraint would refuse, which would mean the schema and this file had
 * drifted apart.
 */
function loanStatus(value: string): WalletLoanStatus {
  if (value === 'active' || value === 'repaid' || value === 'overdue') return value;
  throw new Error('database returned invalid loan status');
}

function transactionLabel(type: string): string {
  return TRANSACTION_LABELS[type] ?? '경제 활동';
}

function directionFor(netAmount: WldAmount): WalletTransactionDirection {
  const amount = BigInt(netAmount);
  if (amount > 0n) return 'in';
  if (amount < 0n) return 'out';
  return 'neutral';
}

function normalizeBalances(rows: readonly WalletBalanceRow[]): WalletBalancesView {
  const byType = new Map<string, WalletBalanceView>();
  for (const row of rows) {
    if (!ACCOUNT_TYPES.has(row.account_type) || byType.has(row.account_type)) {
      throw new Error('database returned invalid wallet accounts');
    }
    byType.set(row.account_type, {
      availableAmount: wldAmount(row.available_amount, 'available balance'),
      updatedAt: timestamp(row.updated_at, 'balance timestamp'),
    });
  }

  const cash = byType.get('USER_CASH');
  const bank = byType.get('USER_BANK');
  if (!cash || !bank) throw new Error('active cash and bank wallets are required');

  return {
    currency: 'WLD',
    cash,
    bank,
    totalAvailableAmount: wldAmount(
      (BigInt(cash.availableAmount) + BigInt(bank.availableAmount)).toString(),
      'total available amount',
    ),
  };
}

function normalizeTransactions(rows: readonly WalletTransactionRow[]): WalletTransactionView[] {
  return rows.map((row) => {
    const netAmount = wldAmount(row.net_amount, 'transaction amount');
    return {
      transactionId: requireUuid(row.transaction_id, 'database transaction id'),
      type: row.type,
      label: transactionLabel(row.type),
      netAmount,
      direction: directionFor(netAmount),
      occurredAt: timestamp(row.created_at, 'transaction timestamp'),
    };
  });
}

function koreaDate(now: Date): string {
  if (!(now instanceof Date) || Number.isNaN(now.valueOf()))
    throw new TypeError('clock must return a valid Date');
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}

/**
 * Application-facing wallet use cases. The authenticated user ID is a method
 * argument supplied by the session layer; no request DTO can choose a sender.
 */
@Injectable()
export class WalletService {
  readonly repository: WalletRepositoryLike;
  readonly clock: () => Date;

  constructor(
    repository: WalletRepositoryLike,
    { clock = () => new Date() }: { clock?: () => Date } = {},
  ) {
    const requiredMethods: readonly (keyof WalletRepositoryLike)[] = [
      'balancesForUser',
      'recentTransactionsForUser',
      'activeRecipientById',
      'transfer',
      'claimDaily',
    ];
    if (
      !(repository instanceof PostgresWalletRepository) &&
      (!repository || !requiredMethods.every((method) => typeof repository[method] === 'function'))
    ) {
      throw new TypeError('a wallet repository is required');
    }
    if (typeof clock !== 'function') throw new TypeError('clock must be a function');
    this.repository = repository;
    this.clock = clock;
  }

  async overview(
    authenticatedUserId: string,
    { recentLimit = 10 }: WalletOverviewOptions = {},
  ): Promise<WalletOverview> {
    const userId = requireUuid(authenticatedUserId, 'authenticated user id');
    const limit = requireRecentLimit(recentLimit);
    const [balances, transactions] = await Promise.all([
      this.repository.balancesForUser(userId),
      this.repository.recentTransactionsForUser(userId, limit),
    ]);
    return {
      userId,
      balances: normalizeBalances(balances),
      recentTransactions: normalizeTransactions(transactions),
    };
  }

  async transfer(
    authenticatedUserId: string,
    { recipientUserId, amount, idempotencyKey }: WalletTransferRequest = {},
  ): Promise<WalletTransferReceipt> {
    const actorUserId = requireUuid(authenticatedUserId, 'authenticated user id');
    const recipient = requireUuid(recipientUserId, 'recipient user id');
    const transferAmount = requirePositiveSafeInteger(amount, 'amount');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    if (actorUserId === recipient) throw new WalletInputError('cannot transfer to yourself');

    // Only an internal UUID can reach this lookup; OAuth subjects, email, and
    // display names never become recipient selectors.
    const activeRecipient = await this.repository.activeRecipientById(recipient);
    if (!activeRecipient || activeRecipient.userId !== recipient) throw new WalletRecipientError();

    const receipt = await this.repository.transfer({
      actorUserId,
      recipientUserId: recipient,
      amount: transferAmount,
      idempotencyKey: key,
    });
    return { transactionId: requireUuid(receipt.transactionId, 'database transaction id') };
  }

  async claimDaily(
    authenticatedUserId: string,
    { idempotencyKey }: WalletClaimRequest = {},
  ): Promise<WalletRewardReceipt> {
    const actorUserId = requireUuid(authenticatedUserId, 'authenticated user id');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    const reward = await this.repository.claimDaily({
      actorUserId,
      rewardDate: koreaDate(this.clock()),
      idempotencyKey: key,
    });
    if (typeof reward.replayed !== 'boolean')
      throw new Error('database returned an invalid daily-reward receipt');
    return {
      transactionId: requireUuid(reward.transaction_id, 'database transaction id'),
      amount: positiveWldAmount(reward.amount, 'daily reward amount'),
      replayed: reward.replayed,
    };
  }

  async claimWork(
    authenticatedUserId: string,
    { idempotencyKey }: WalletClaimRequest = {},
  ): Promise<WalletRewardReceipt> {
    const actorUserId = requireUuid(authenticatedUserId, 'authenticated user id');
    const key = requireUuid(idempotencyKey, 'idempotency key');
    const reward = await this.repository.claimWork({ actorUserId, idempotencyKey: key });
    if (typeof reward.replayed !== 'boolean')
      throw new Error('database returned an invalid work-reward receipt');
    return {
      transactionId: requireUuid(reward.transaction_id, 'database transaction id'),
      amount: positiveWldAmount(reward.amount, 'work reward amount'),
      replayed: reward.replayed,
    };
  }

  async bankMove(
    authenticatedUserId: string,
    { direction, amount, idempotencyKey }: WalletBankMoveRequest = {},
  ): Promise<WalletTransferReceipt> {
    const actorUserId = requireUuid(authenticatedUserId, 'authenticated user id');
    const receipt = await this.repository.moveBankBalance({
      actorUserId,
      direction,
      amount: requirePositiveSafeInteger(amount, 'amount'),
      idempotencyKey: requireUuid(idempotencyKey, 'idempotency key'),
    });
    return { transactionId: requireUuid(receipt.transaction_id, 'database transaction id') };
  }

  async loans(authenticatedUserId: string): Promise<WalletLoanView[]> {
    const actorUserId = requireUuid(authenticatedUserId, 'authenticated user id');
    if (typeof this.repository.loansForUser !== 'function') return [];
    const rows = await this.repository.loansForUser(actorUserId);
    if (!Array.isArray(rows)) throw new Error('database returned invalid loans');
    return rows.map((row) => ({
      loanId: requireUuid(row.loan_id, 'loan id'),
      principalAmount: positiveWldAmount(row.principal_amount, 'loan principal'),
      interestAmount: wldAmount(row.interest_amount, 'loan interest'),
      outstandingAmount: wldAmount(row.outstanding_amount, 'loan outstanding'),
      status: loanStatus(row.status),
      issuedAt: timestamp(row.issued_at, 'loan issued timestamp'),
      repaidAt: row.repaid_at ? timestamp(row.repaid_at, 'loan repaid timestamp') : null,
    }));
  }

  async borrow(
    authenticatedUserId: string,
    { principalAmount, idempotencyKey }: WalletBorrowRequest = {},
  ): Promise<WalletBorrowReceipt> {
    const actorUserId = requireUuid(authenticatedUserId, 'authenticated user id');
    const receipt = await this.repository.borrow({
      actorUserId,
      principalAmount: requirePositiveSafeInteger(principalAmount, 'principal amount'),
      idempotencyKey: requireUuid(idempotencyKey, 'idempotency key'),
    });
    return {
      loanId: requireUuid(receipt.loan_id, 'loan id'),
      principalAmount: positiveWldAmount(receipt.principal_amount, 'loan principal'),
      interestAmount: wldAmount(receipt.interest_amount, 'loan interest'),
      outstandingAmount: wldAmount(receipt.outstanding_amount, 'loan outstanding'),
      replayed: receipt.replayed === true,
    };
  }

  async repayLoan(
    authenticatedUserId: string,
    { loanId, amount, idempotencyKey }: WalletRepayRequest = {},
  ): Promise<WalletRepayReceipt> {
    const actorUserId = requireUuid(authenticatedUserId, 'authenticated user id');
    const receipt = await this.repository.repay({
      actorUserId,
      loanId: requireUuid(loanId, 'loan id'),
      amount: requirePositiveSafeInteger(amount, 'amount'),
      idempotencyKey: requireUuid(idempotencyKey, 'idempotency key'),
    });
    return {
      loanId: requireUuid(receipt.loan_id, 'loan id'),
      paidAmount: positiveWldAmount(receipt.paid_amount, 'loan payment'),
      outstandingAmount: wldAmount(receipt.outstanding_amount, 'loan outstanding'),
      replayed: receipt.replayed === true,
    };
  }
}

export { koreaDate };
