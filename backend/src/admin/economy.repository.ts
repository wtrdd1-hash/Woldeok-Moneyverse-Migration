import type { Queryable } from '../core/db';
import { queryOne, queryRows } from '../core/db';

/**
 * The economy console: what the money supply is doing, what has been raised
 * as an alert, and paying many members at once.
 *
 * Every method calls a SECURITY DEFINER function from migrations 084 and 087.
 * `admin_alerts`, `admin_bulk_payouts` and `admin_bulk_payout_items` are all
 * revoked from `moneyverse_app`, so there is no table here to read even if
 * somebody preferred a join -- and the functions re-decide the caller's
 * authority for themselves. The guards on the controller decide who may
 * knock, not who may act.
 */

export class EconomyConsoleInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EconomyConsoleInputError';
  }
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** `progression_stages.code` in migration 076: starter, early, middle, advanced. */
const STAGE_CODE_PATTERN = /^[a-z][a-z0-9_]{1,31}$/;

/**
 * The floor `admin_normalized_reason` (058) enforces, repeated here so an
 * operator is told which field is wrong instead of receiving a database
 * message about a function they have never heard of. The database is still
 * the authority: it refuses the same value even if this check is bypassed.
 */
const REASON_MIN = 10;
const REASON_MAX = 1000;

/** `p_amount BETWEEN 1 AND 1000000`, from the CHECK on admin_bulk_payouts. */
const AMOUNT_MIN = 1;
const AMOUNT_MAX = 1_000_000;

/**
 * `c_maximum_targets` in `admin_execute_bulk_payout`. An explicit list longer
 * than the batch can ever pay is refused here rather than after the operator
 * has waited for the preview to count it.
 */
const MAX_EXPLICIT_TARGETS = 5000;

/** `least(greatest(coalesce(p_limit, 30), 1), 200)` in `admin_list_alerts`. */
const ALERT_LIMIT_DEFAULT = 30;
const ALERT_LIMIT_MAX = 200;

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new EconomyConsoleInputError(`${field} must be a UUID`);
  }
}

function assertReason(value: unknown): string {
  if (typeof value !== 'string') throw new EconomyConsoleInputError('a reason is required');
  const reason = value.trim();
  if (reason.length < REASON_MIN || reason.length > REASON_MAX) {
    throw new EconomyConsoleInputError(
      `the reason must be ${REASON_MIN} to ${REASON_MAX} characters`,
    );
  }
  return reason;
}

/**
 * A payout amount is the one number a request may carry as a JSON integer:
 * an operator cannot type a figure above a safe integer, and the database
 * bounds it again. `Number.isSafeInteger` does not narrow `unknown`, so the
 * typeof test is load-bearing rather than decorative.
 */
function assertAmount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new EconomyConsoleInputError('the amount must be a whole number');
  }
  if (value < AMOUNT_MIN || value > AMOUNT_MAX) {
    throw new EconomyConsoleInputError(
      `the amount must be between ${AMOUNT_MIN} and ${AMOUNT_MAX} WLD`,
    );
  }
  return value;
}

function assertAlertLimit(value: unknown): number {
  if (value === undefined || value === null) return ALERT_LIMIT_DEFAULT;
  if (typeof value !== 'number' || !Number.isSafeInteger(value)) {
    throw new EconomyConsoleInputError('limit must be a whole number');
  }
  if (value < 1 || value > ALERT_LIMIT_MAX) {
    throw new EconomyConsoleInputError(`limit must be between 1 and ${ALERT_LIMIT_MAX}`);
  }
  return value;
}

export interface BulkPayoutFilter {
  readonly userIds?: unknown;
  readonly minWorkCompletions?: unknown;
  readonly stageCode?: unknown;
}

/**
 * `admin_bulk_payout_targets` accepts exactly three keys and raises 22023 on
 * a fourth, because a filter quietly wider than the operator believes is how
 * a payment reaches everybody. This builds the object the function will
 * accept and, crucially, *omits* a field that was not given: sending
 * `{"userIds": null}` is not the same as sending nothing -- the function's
 * `p_filter ? 'userIds'` sees the key, finds a JSON null where an array
 * belongs, and refuses the whole batch.
 */
function normalizeFilter(filter: BulkPayoutFilter): string {
  const normalized: Record<string, unknown> = {};

  if (filter.userIds !== undefined && filter.userIds !== null) {
    if (!Array.isArray(filter.userIds)) {
      throw new EconomyConsoleInputError('userIds must be an array of member ids');
    }
    if (filter.userIds.length === 0) {
      // An empty array matches nobody, which reads as "pay everyone" to
      // anybody skimming the request and as "pay no one" to the function.
      // Refusing is the only answer that cannot be misread.
      throw new EconomyConsoleInputError('userIds must name at least one member');
    }
    if (filter.userIds.length > MAX_EXPLICIT_TARGETS) {
      throw new EconomyConsoleInputError(
        `at most ${MAX_EXPLICIT_TARGETS} members can be named in one payout`,
      );
    }
    for (const candidate of filter.userIds) assertUuid(candidate, 'each member id');
    normalized.userIds = filter.userIds;
  }

  if (filter.minWorkCompletions !== undefined && filter.minWorkCompletions !== null) {
    const minimum = filter.minWorkCompletions;
    if (typeof minimum !== 'number' || !Number.isSafeInteger(minimum) || minimum < 0) {
      throw new EconomyConsoleInputError(
        'minWorkCompletions must be zero or a positive whole number',
      );
    }
    normalized.minWorkCompletions = minimum;
  }

  if (filter.stageCode !== undefined && filter.stageCode !== null) {
    if (typeof filter.stageCode !== 'string' || !STAGE_CODE_PATTERN.test(filter.stageCode)) {
      throw new EconomyConsoleInputError('stageCode must name a progression stage');
    }
    normalized.stageCode = filter.stageCode;
  }

  return JSON.stringify(normalized);
}

/**
 * public.admin_economy_dashboard RETURNS TABLE:
 * packages/database/migrations/087-admin-metrics-and-alerts.sql
 *
 * Every amount is `numeric` and every count is `bigint`, so both arrive as
 * strings and stay strings: a supply figure has 38 digits available to it and
 * `Number` would round the top of that range away silently.
 *
 * `reconciliation_ok` and `reconciliation_at` are null when no snapshot has
 * ever been taken. That is a third state, not a failure -- "never checked"
 * and "checked and wrong" must not render as the same sentence.
 */
export interface EconomyDashboardRow {
  readonly m2_amount: string;
  readonly member_cash_amount: string;
  readonly member_bank_amount: string;
  readonly escrow_amount: string;
  readonly net_mint_issuance_amount: string;
  readonly sink_absorbed_amount: string;
  readonly issued_1h: string;
  readonly issued_24h: string;
  readonly issued_7d: string;
  readonly burned_24h: string;
  readonly net_issued_24h: string;
  /** A ratio between 0 and 1, not money: the largest wallet over all wallets. */
  readonly top_holder_share: string;
  readonly member_count: string;
  readonly reconciliation_ok: boolean | null;
  readonly reconciliation_at: Date | null;
  readonly failed_outbox_count: string;
  readonly open_alert_count: string;
  readonly running_job_count: string;
}

/**
 * public.admin_list_alerts RETURNS TABLE:
 * packages/database/migrations/087-admin-metrics-and-alerts.sql
 */
export interface EconomyAlertRow {
  readonly alert_id: string;
  readonly kind: string;
  readonly severity: string;
  readonly summary: string;
  readonly detail: unknown;
  readonly raised_at: Date;
  readonly acknowledged_at: Date | null;
}

/**
 * public.admin_preview_bulk_payout RETURNS TABLE:
 * packages/database/migrations/084-bulk-payouts.sql
 *
 * `payable_count` is the one the operator confirms against: a member with no
 * active cash account is in the target set and cannot be paid, and the
 * difference between the two counts is what they need to see beforehand
 * rather than in the outcome table afterwards.
 */
export interface BulkPayoutPreviewRow {
  readonly target_count: string;
  readonly payable_count: string;
  readonly total_amount: string;
  readonly policy_version: string | null;
}

/**
 * public.admin_execute_bulk_payout RETURNS TABLE:
 * packages/database/migrations/084-bulk-payouts.sql
 *
 * These four counts are `integer` in the function, not `bigint`, and the
 * batch is capped at 5000 targets -- so they arrive as JavaScript numbers and
 * are exact. The preview's counts above are `bigint` and arrive as strings.
 * The asymmetry is the migrations', not this module's, and inventing a cast
 * to hide it would put a lie between the screen and the function.
 */
export interface BulkPayoutReceiptRow {
  readonly payout_id: string;
  readonly target_count: number;
  readonly paid_count: number;
  readonly skipped_count: number;
  readonly failed_count: number;
  readonly replayed: boolean;
}

/**
 * public.admin_bulk_payout_report RETURNS TABLE:
 * packages/database/migrations/084-bulk-payouts.sql
 *
 * One row per target, with the reason a member was skipped or failed. A
 * summary line saying "1,240 paid" is not a record of anything; these are.
 */
export interface BulkPayoutItemRow {
  readonly user_id: string;
  readonly outcome: string;
  readonly detail: string;
  readonly transaction_id: string | null;
}

export class EconomyConsoleRepository {
  constructor(private readonly pool: Queryable) {}

  /**
   * One row, always. `admin_economy_dashboard` aggregates over CTEs that are
   * never empty, so a null here would mean the function changed shape rather
   * than that the economy is idle -- and a route answering 200 with an empty
   * body is indistinguishable from a healthy economy with nothing in it.
   */
  async dashboard(actor: unknown): Promise<EconomyDashboardRow> {
    assertUuid(actor, 'actor');
    const row = await queryOne<EconomyDashboardRow>(
      this.pool,
      `SELECT board.m2_amount::text AS m2_amount,
              board.member_cash_amount::text AS member_cash_amount,
              board.member_bank_amount::text AS member_bank_amount,
              board.escrow_amount::text AS escrow_amount,
              board.net_mint_issuance_amount::text AS net_mint_issuance_amount,
              board.sink_absorbed_amount::text AS sink_absorbed_amount,
              board.issued_1h::text AS issued_1h,
              board.issued_24h::text AS issued_24h,
              board.issued_7d::text AS issued_7d,
              board.burned_24h::text AS burned_24h,
              board.net_issued_24h::text AS net_issued_24h,
              round(board.top_holder_share, 6)::text AS top_holder_share,
              board.member_count::text AS member_count,
              board.reconciliation_ok,
              board.reconciliation_at,
              board.failed_outbox_count::text AS failed_outbox_count,
              board.open_alert_count::text AS open_alert_count,
              board.running_job_count::text AS running_job_count
       FROM public.admin_economy_dashboard($1) AS board`,
      [actor],
    );
    if (!row) throw new Error('admin_economy_dashboard did not return a row');
    return row;
  }

  alerts(actor: unknown, limit?: unknown): Promise<EconomyAlertRow[]> {
    assertUuid(actor, 'actor');
    const requested = assertAlertLimit(limit);
    return queryRows<EconomyAlertRow>(
      this.pool,
      `SELECT alert.alert_id::text AS alert_id, alert.kind, alert.severity, alert.summary,
              alert.detail, alert.raised_at, alert.acknowledged_at
       FROM public.admin_list_alerts($1, $2) AS alert`,
      [actor, requested],
    );
  }

  /**
   * False means the alert was already acknowledged, or there is no such
   * alert. The function separates neither, and neither is a failure: it
   * updates only a row whose `acknowledged_at` is still null, so a second
   * press of the button changes nothing and reports so.
   */
  async acknowledgeAlert(input: {
    readonly actorUserId: unknown;
    readonly alertId: unknown;
    readonly reason: unknown;
  }): Promise<{ readonly acknowledged: boolean }> {
    assertUuid(input.actorUserId, 'actor');
    assertUuid(input.alertId, 'alert id');
    const reason = assertReason(input.reason);
    const row = await queryOne<{ readonly acknowledged: boolean }>(
      this.pool,
      'SELECT public.admin_acknowledge_alert($1, $2, $3) AS acknowledged',
      [input.actorUserId, input.alertId, reason],
    );
    if (!row) throw new Error('admin_acknowledge_alert did not return a row');
    return { acknowledged: row.acknowledged };
  }

  async previewBulkPayout(input: {
    readonly actorUserId: unknown;
    readonly filter: BulkPayoutFilter;
    readonly amount: unknown;
  }): Promise<BulkPayoutPreviewRow> {
    assertUuid(input.actorUserId, 'actor');
    const amount = assertAmount(input.amount);
    const filter = normalizeFilter(input.filter);
    const row = await queryOne<BulkPayoutPreviewRow>(
      this.pool,
      `SELECT summary.target_count::text AS target_count,
              summary.payable_count::text AS payable_count,
              summary.total_amount::text AS total_amount,
              summary.policy_version
       FROM public.admin_preview_bulk_payout($1, $2::jsonb, $3::bigint) AS summary`,
      [input.actorUserId, filter, amount],
    );
    if (!row) throw new Error('admin_preview_bulk_payout did not return a row');
    return row;
  }

  /**
   * The key is the batch's. Every payment inside it derives its own key from
   * this one and the member, so a batch retried after dying halfway through
   * re-uses each member's key and nobody is paid twice. The caller must mint
   * a fresh key per batch and re-send the same one to retry -- exactly the
   * opposite of the reflex to generate a new one because the last attempt
   * looked like it failed.
   */
  async reverseTransaction(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly transactionId: unknown;
    readonly reason: unknown;
  }): Promise<{
    readonly transaction_id: string;
    readonly reverses_transaction_id: string;
    readonly amount: string;
    readonly replayed: boolean;
  }> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor');
    assertUuid(input.transactionId, 'transaction');
    const reason = assertReason(input.reason);
    const row = await queryOne<{
      transaction_id: string;
      reverses_transaction_id: string;
      amount: string;
      replayed: boolean;
    }>(
      this.pool,
      `SELECT transaction_id::text, reverses_transaction_id::text, amount::text, replayed
       FROM public.economy_reverse_transaction($1::uuid, $2::uuid, $3::uuid, $4::text)`,
      [input.idempotencyKey, input.actorUserId, input.transactionId, reason],
    );
    if (!row) throw new Error('economy_reverse_transaction did not return a row');
    return row;
  }

  async executeBulkPayout(input: {
    readonly idempotencyKey: unknown;
    readonly actorUserId: unknown;
    readonly filter: BulkPayoutFilter;
    readonly amount: unknown;
    readonly reason: unknown;
  }): Promise<BulkPayoutReceiptRow> {
    assertUuid(input.idempotencyKey, 'idempotency key');
    assertUuid(input.actorUserId, 'actor');
    const amount = assertAmount(input.amount);
    const reason = assertReason(input.reason);
    const filter = normalizeFilter(input.filter);
    const row = await queryOne<BulkPayoutReceiptRow>(
      this.pool,
      `SELECT batch.payout_id::text AS payout_id, batch.target_count, batch.paid_count,
              batch.skipped_count, batch.failed_count, batch.replayed
       FROM public.admin_execute_bulk_payout($1, $2, $3::jsonb, $4::bigint, $5) AS batch`,
      [input.idempotencyKey, input.actorUserId, filter, amount, reason],
    );
    if (!row) throw new Error('admin_execute_bulk_payout did not return a row');
    return row;
  }

  payoutReport(actor: unknown, payoutId: unknown): Promise<BulkPayoutItemRow[]> {
    assertUuid(actor, 'actor');
    assertUuid(payoutId, 'payout id');
    return queryRows<BulkPayoutItemRow>(
      this.pool,
      `SELECT item.user_id::text AS user_id, item.outcome, item.detail,
              item.transaction_id::text AS transaction_id
       FROM public.admin_bulk_payout_report($1, $2) AS item`,
      [actor, payoutId],
    );
  }

  async faucetSinkStats(): Promise<{
    summary: Record<string, unknown>;
    daily: Array<Record<string, unknown>>;
  }> {
    const summary = await queryOne<Record<string, unknown>>(this.pool, `SELECT * FROM public.v_economy_summary`);
    const daily = await queryRows<Record<string, unknown>>(
      this.pool,
      `SELECT stat_date::text AS stat_date,
              faucet_amount::text AS faucet_amount,
              sink_amount::text AS sink_amount,
              tax_amount::text AS tax_amount,
              net_change::text AS net_change,
              sink_ratio_percent::text AS sink_ratio_percent
       FROM public.v_daily_economy_stats
       ORDER BY stat_date DESC LIMIT 30`
    );
    return {
      summary: summary ?? {},
      daily,
    };
  }

}
