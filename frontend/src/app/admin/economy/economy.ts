import { groupDigits } from '@/lib/money';

/**
 * The economy console's vocabulary.
 *
 * Every noun the console renders arrives from a SECURITY DEFINER function in
 * English -- an alert kind out of a CHECK constraint, a payout outcome, the
 * sentence the adjustment engine writes when it refuses to run -- so the
 * words an operator reads are written here rather than fetched.
 *
 * It carries no `server-only` and touches neither the network nor the clock,
 * which is what lets the client controls, the parts and the tests import it
 * as it stands.
 */

/**
 * `public.admin_economy_dashboard` RETURNS TABLE, as it arrives over the wire:
 * packages/database/migrations/087-admin-metrics-and-alerts.sql.
 *
 * Every amount is `numeric` and every count is `bigint`, so both are strings
 * and stay strings the whole way to the DOM. `reconciliation_ok` and
 * `reconciliation_at` are null together when no snapshot has ever been taken:
 * "never checked" is a third state, not a failed check.
 */
export interface EconomyDashboard {
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
  /** A ratio between 0 and 1, rounded to six places by the repository. */
  readonly top_holder_share: string;
  readonly member_count: string;
  readonly reconciliation_ok: boolean | null;
  readonly reconciliation_at: string | null;
  readonly failed_outbox_count: string;
  readonly open_alert_count: string;
  readonly running_job_count: string;
}

/** `public.admin_list_alerts` RETURNS TABLE: the same migration. */
export interface EconomyAlert {
  readonly alert_id: string;
  readonly kind: string;
  readonly severity: string;
  readonly summary: string;
  readonly detail: unknown;
  readonly raised_at: string;
  readonly acknowledged_at: string | null;
}

/**
 * `public.admin_preview_bulk_payout` RETURNS TABLE:
 * packages/database/migrations/084-bulk-payouts.sql.
 *
 * All three counts are `bigint` and arrive as strings. `payable_count` is the
 * one the operator confirms against, and the gap between it and
 * `target_count` is the whole reason the preview exists.
 */
export interface BulkPayoutPreview {
  readonly target_count: string;
  readonly payable_count: string;
  readonly total_amount: string;
  readonly policy_version: string | null;
}

/**
 * `public.admin_execute_bulk_payout` RETURNS TABLE: the same migration.
 *
 * These four counts are `integer` rather than `bigint` -- the batch is capped
 * at five thousand targets -- so they arrive as JSON numbers while the
 * preview's counts above arrive as strings. The asymmetry is the migration's
 * and the API kept it rather than putting a cast between the screen and the
 * function.
 */
export interface BulkPayoutReceipt {
  readonly payout_id: string;
  readonly target_count: number;
  readonly paid_count: number;
  readonly skipped_count: number;
  readonly failed_count: number;
  readonly replayed: boolean;
}

/**
 * `public.admin_bulk_payout_report` RETURNS TABLE: the same migration.
 *
 * One row per target. `detail` is `NOT NULL DEFAULT ''`, so a paid row
 * carries an empty string rather than a null, and `transaction_id` is null on
 * every row that was not paid.
 */
export interface BulkPayoutItem {
  readonly user_id: string;
  readonly outcome: string;
  readonly detail: string;
  readonly transaction_id: string | null;
}

/**
 * `public.admin_list_policy_knobs` RETURNS TABLE:
 * packages/database/migrations/092-economy-auto-policy-engine.sql, over the
 * registry 089 seeds.
 *
 * The four `numeric` columns are cast to text by the repository so no bound
 * is rounded on the way through. `paused_reason` is `NOT NULL DEFAULT ''` and
 * is only written when a superadmin takes the knob off automatic.
 */
export interface PolicyKnob {
  readonly knob_key: string;
  readonly title: string;
  readonly unit: string;
  readonly current_value: string;
  readonly baseline_value: string;
  readonly min_value: string;
  readonly max_value: string;
  readonly auto_adjustable: boolean;
  readonly paused_reason: string;
  readonly updated_at: string;
}

/**
 * One entry of the proposal's `adjustments` array, as
 * `economy_propose_policy_adjustment` builds it with jsonb_build_object.
 *
 * `from` and `to` are `numeric` inside a jsonb document, which means they
 * reach this file as JSON *numbers* rather than as strings. They are knob
 * values -- a percentage, a basis-point delta, a daily cap of a few thousand
 * -- and never money, so nothing here is at risk of the rounding that makes
 * every balance in this product a string. They are turned back into text
 * before they are compared or shown, so no arithmetic is done on them at all.
 */
export interface PolicyAdjustment {
  readonly knob: string;
  readonly title: string;
  readonly unit: string;
  readonly from: number | string;
  readonly to: number | string;
  readonly rules: readonly string[];
}

/**
 * What `admin_preview_auto_policy` answers, and what the weekly run acts on.
 *
 * Every field is optional because the repository answers `{}` when the
 * function returned no row -- which is a state the screen has to be able to
 * say out loud rather than render as an engine with nothing to do.
 */
export interface AutoPolicyProposal {
  readonly eligible?: boolean;
  readonly blockedBy?: readonly string[];
  readonly sourceMetrics?: Readonly<Record<string, unknown>>;
  readonly adjustments?: readonly PolicyAdjustment[];
  readonly observations?: readonly string[];
}

/** What `admin_run_auto_policy_now` answers. */
export interface AutoPolicyRun {
  readonly applied?: boolean;
  readonly version?: string;
  readonly rollbackVersion?: string | null;
  readonly blockedBy?: readonly string[];
  readonly adjustments?: readonly PolicyAdjustment[];
}

/** `GET /api/v1/admin/controls/auto-policy`, both halves in one call. */
export interface AutoPolicyBoard {
  readonly knobs: readonly PolicyKnob[];
  readonly preview: AutoPolicyProposal;
}

const DECIMAL = /^[+-]?\d+(\.\d+)?$/;

interface DecimalParts {
  readonly negative: boolean;
  readonly whole: string;
  readonly fraction: string;
}

function split(value: string): DecimalParts | null {
  if (!DECIMAL.test(value)) return null;
  const negative = value.startsWith('-');
  const [whole = '0', fraction = ''] = value.replace(/^[+-]/, '').split('.');
  return { negative, whole, fraction };
}

/**
 * Compares two decimal strings without either becoming a number.
 *
 * The knob bounds are `numeric` with no declared scale, so a range an
 * operator widened by hand can carry more digits than a double holds. Padding
 * both fractions to one width and comparing the digits as integers is exact
 * at any length; `Number(a) - Number(b)` is exact only until it is not.
 *
 * Null for a value that is not a decimal at all, which the caller has to
 * handle rather than read as "equal".
 */
export function compareDecimalText(left: string, right: string): number | null {
  const a = split(left);
  const b = split(right);
  if (a === null || b === null) return null;

  const width = Math.max(a.fraction.length, b.fraction.length);
  const scaled = (parts: DecimalParts): bigint => {
    const magnitude = BigInt(parts.whole + parts.fraction.padEnd(width, '0'));
    return parts.negative ? -magnitude : magnitude;
  };
  const scaledLeft = scaled(a);
  const scaledRight = scaled(b);
  if (scaledLeft === scaledRight) return 0;
  return scaledLeft < scaledRight ? -1 : 1;
}

/**
 * The same decimal with its meaningless digits gone: `100.00` is `100` and
 * `-0.0` is `0`, because a minus sign in front of nothing states a direction
 * the value does not have.
 */
export function trimDecimalText(value: string): string | null {
  const parts = split(value);
  if (parts === null) return null;
  const fraction = parts.fraction.replace(/0+$/, '');
  const whole = parts.whole.replace(/^0+(?=\d)/, '');
  const magnitude = fraction === '' ? whole : `${whole}.${fraction}`;
  return parts.negative && /[1-9]/.test(magnitude) ? `-${magnitude}` : magnitude;
}

/**
 * A knob value from the proposal, as text.
 *
 * The jsonb document has already made it a JSON number by the time it reaches
 * this process, so this is not a conversion -- it is the last chance to write
 * the value down before anything else is tempted to do arithmetic on it.
 */
export function numericText(value: number | string): string {
  return typeof value === 'string' ? value : String(value);
}

/**
 * The ratio `top_holder_share` as a percentage, to two places.
 *
 * A share is not money, but it is not a number either: the column is
 * `numeric` and the repository rounds it to six places and casts it to text,
 * so multiplying by a hundred is a two-place shift of the decimal point
 * rather than a multiplication. Doing it on the digits keeps `0.999999` from
 * rendering as `100.00%`, which is a different claim about who holds what.
 */
export function percentFromRatio(ratio: string): string | null {
  const parts = split(ratio);
  if (parts === null) return null;

  // x100 for the percentage and x100 again for the two places kept: four
  // digits of the fraction become the integer, and the fifth decides the
  // rounding.
  const scaledDigits = parts.whole + parts.fraction.slice(0, 4).padEnd(4, '0');
  const rounding = parts.fraction.charAt(4);
  let scaled = BigInt(scaledDigits);
  if (rounding !== '' && rounding >= '5') scaled += 1n;

  const sign = parts.negative && scaled !== 0n ? '−' : '';
  const whole = (scaled / 100n).toString();
  const remainder = (scaled % 100n).toString().padStart(2, '0');
  return `${sign}${groupDigits(whole)}.${remainder}%`;
}

/** A count of members, grouped and given its unit so the Korean reads. */
export function memberCount(value: string): string {
  return /^-?\d+$/.test(value) ? `${groupDigits(value)}명` : '—';
}

/** A count of things that are not members and not money. */
export function plainCount(value: string, unit: string): string {
  return /^-?\d+$/.test(value) ? `${groupDigits(value)}${unit}` : '—';
}

/**
 * A knob's value in the unit 089 gave it.
 *
 * `bps` carries an explicit sign because that knob is a *delta* on the
 * deposit rate rather than the rate itself, and `2bp` and `+2bp` are the same
 * number saying two different things about what it does.
 */
export function knobValueLabel(value: string, unit: string): string {
  const normalized = trimDecimalText(value);
  if (normalized === null) return '—';
  const grouped = groupDigits(normalized);
  if (unit === 'percent') return `${grouped}%`;
  if (unit === 'bps') {
    const signed = normalized.startsWith('-') || normalized === '0' ? grouped : `+${grouped}`;
    return `${signed}bp`;
  }
  return `${grouped} WLD`;
}

/** The approved range §15.4 puts around a knob, as one phrase. */
export function knobRangeLabel(knob: PolicyKnob): string {
  const floor = knobValueLabel(knob.min_value, knob.unit);
  const ceiling = knobValueLabel(knob.max_value, knob.unit);
  return `${floor} ~ ${ceiling}`;
}

/** Which way an adjustment moves a knob, or null when it moves nowhere. */
export function adjustmentDirection(adjustment: PolicyAdjustment): 'up' | 'down' | null {
  const comparison = compareDecimalText(
    numericText(adjustment.to),
    numericText(adjustment.from),
  );
  if (comparison === null || comparison === 0) return null;
  return comparison > 0 ? 'up' : 'down';
}

const SEVERITIES: Readonly<Record<string, string>> = Object.freeze({
  info: '정보',
  warning: '주의',
  critical: '심각',
});

/** The severity in Korean, or the code itself for one this build has not met. */
export function severityLabel(severity: string): string {
  return SEVERITIES[severity] ?? severity;
}

/**
 * The alert kinds raised across migrations 086-092.
 *
 * A kind this build has not been taught keeps its own key rather than
 * disappearing: an alert an operator cannot name is still an alert they have
 * to act on, and a blank cell would read as though nothing had happened.
 */
const ALERT_KINDS: Readonly<Record<string, string>> = Object.freeze({
  'economy.reconciliation.failed': '원장 대사 실패',
  'economy.issuance.spike': '발행량 급증',
  'economy.correction.large': '대규모 정정',
  'economy.target.missed': '지표 목표 이탈',
  'economy.policy.auto_applied': '자동 정책 적용',
  'audit.chain.failed': '감사 사슬 검증 실패',
  'admin.login.failures': '관리자 로그인 실패 누적',
});

export function alertKindLabel(kind: string): string {
  return ALERT_KINDS[kind] ?? kind;
}

const OUTCOMES: Readonly<Record<string, string>> = Object.freeze({
  paid: '지급',
  skipped: '건너뜀',
  failed: '실패',
});

export function outcomeLabel(outcome: string): string {
  return OUTCOMES[outcome] ?? outcome;
}

/**
 * Why one member of a batch was not paid.
 *
 * `no active cash account` is the only sentence 084 writes itself; everything
 * else on a failed row is `SQLERRM` from whatever refused the posting, which
 * is English and unpredictable and belongs on screen unchanged rather than
 * flattened into one Korean apology that hides which member hit what.
 */
export function payoutDetailLabel(item: BulkPayoutItem): string {
  if (item.detail === '') return '';
  if (item.detail === 'no active cash account') return '사용 중인 현금 계좌가 없어요.';
  return item.detail;
}

export type ReconciliationState = 'never' | 'passed' | 'failed';

/**
 * The three states of `reconciliation_ok`, kept apart.
 *
 * The column is null until a snapshot has ever been taken, and rendering
 * "never checked" and "checked and failed" as the same red badge would tell
 * an operator the ledger is broken when nothing has looked at it yet.
 */
export function reconciliationState(
  ok: boolean | null,
  at: string | null,
): ReconciliationState {
  if (ok === null || at === null) return 'never';
  return ok ? 'passed' : 'failed';
}

/**
 * §15.3's rules, named in the words the rule is written in.
 *
 * The proposal lists the rules that moved each knob, and a knob moving 5%
 * with no reason beside it is the thing an operator cannot sign off on.
 */
const RULES: Readonly<Record<string, string>> = Object.freeze({
  burn_below_50: '소각이 발행의 50% 아래로 한 주 내내 머물렀어요',
  burn_above_100: '소각이 발행의 100%를 한 주 내내 넘었어요',
  new_member_holdings_low: '신규 회원 보유액 중앙값이 기준선보다 낮아요',
  new_member_holdings_high: '신규 회원 보유액 중앙값이 기준선보다 높아요',
  first_business_slow: '첫 사업까지 걸리는 기간이 길어졌어요',
  one_job_dominates: '한 직업이 작업 배정을 과도하게 차지했어요',
  shop_short: '상점 품목이 자주 품절됐어요',
  shop_slow: '상점 품목이 거의 팔리지 않았어요',
  money_parked: '예금에 묶인 돈의 비중이 높아요',
  circulation_fell: '통화량이 크게 줄었어요',
});

export function ruleLabel(rule: string): string {
  return RULES[rule] ?? rule;
}

/**
 * Why the engine will not run, in Korean.
 *
 * `blockedBy` is English operator prose assembled inside
 * `economy_propose_policy_adjustment`, two of the six sentences with a value
 * interpolated into them. A sentence this build has not been taught is shown
 * as it stands, because a blocker an operator cannot read is still the reason
 * nothing happened.
 */
export function blockedLabel(reason: string): string {
  const feature = /^the economy_auto_policy switch reads (.+)$/.exec(reason);
  if (feature) return `자동 조정 기능 스위치가 '${feature[1]}' 상태예요.`;

  const recent = /^the last automatic policy is younger than (\d+) days$/.exec(reason);
  if (recent) return `마지막 자동 정책이 적용된 지 ${recent[1]}일이 지나지 않았어요.`;

  if (reason === 'the window is missing daily metrics; the engine reads a whole week or nothing') {
    return '기간의 일별 지표가 다 모이지 않았어요. 엔진은 한 주를 통째로 읽거나 아무것도 읽지 않습니다.';
  }
  if (reason === 'at least one day had too few active members to read') {
    return '활동 회원이 너무 적어 읽을 수 없는 날이 하루 이상 있어요.';
  }
  if (reason === 'the ledger failed to reconcile inside the window') {
    return '기간 안에 원장 대사가 실패한 날이 있어요.';
  }
  if (reason === 'this week already has an automatic policy') {
    return '이번 주에는 이미 자동 정책이 적용됐어요.';
  }
  return reason;
}

/**
 * Whether the engine would write a policy version right now, and why not.
 *
 * `eligible` is false for two different reasons and §15.4 asks for both to be
 * legible: something blocked the run, or nothing blocked it and this week's
 * numbers simply move no knob. An empty proposal object is a third answer --
 * the function returned no row -- and none of the three may be rendered as
 * either of the others.
 */
export type ProposalState = 'unreadable' | 'blocked' | 'nothing_to_do' | 'ready';

export function proposalState(proposal: AutoPolicyProposal): ProposalState {
  if (proposal.eligible === undefined && proposal.adjustments === undefined) {
    return 'unreadable';
  }
  if ((proposal.blockedBy ?? []).length > 0) return 'blocked';
  if ((proposal.adjustments ?? []).length === 0) return 'nothing_to_do';
  return 'ready';
}

/**
 * Reads a list of member ids out of one textarea.
 *
 * Operators paste from a spreadsheet, a chat message or a query result, so
 * commas, newlines and stray spaces all separate. Nothing is validated here
 * beyond emptiness -- the API's DTO and `admin_bulk_payout_targets` both
 * refuse a value that is not a UUID, and re-deciding that here would put a
 * second, quietly different rule in front of the first.
 */
export function parseMemberIds(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
}

/** The sentence a preview leaves behind, said from the figures it returned. */
export function previewMessage(preview: BulkPayoutPreview): string {
  const unpayable = unpayableCount(preview);
  if (unpayable === null || unpayable === '0') {
    return `대상 ${memberCount(preview.target_count)} 모두에게 지급할 수 있어요.`;
  }
  // The unit is what keeps the Korean grammatical: every count ends in 명,
  // so the particle after it never changes and no (은/는) pair is needed.
  return `대상 ${memberCount(preview.target_count)} 중 ${memberCount(unpayable)}은 지급할 수 없어요.`;
}

/**
 * How many of the matched members cannot be paid.
 *
 * Both counts are `bigint` strings and the subtraction is done in `BigInt`
 * for the reason every subtraction in this product is: a `Number` is exact
 * only up to 2^53 and nothing here promises to stay under it.
 */
export function unpayableCount(preview: BulkPayoutPreview): string | null {
  if (!/^\d+$/.test(preview.target_count) || !/^\d+$/.test(preview.payable_count)) {
    return null;
  }
  const difference = BigInt(preview.target_count) - BigInt(preview.payable_count);
  return difference < 0n ? null : difference.toString();
}

/** The sentence a finished batch leaves behind, from the counts it returned. */
export function payoutMessage(receipt: BulkPayoutReceipt): string {
  const opening = receipt.replayed
    ? '이미 실행된 지급이에요. 같은 키로 다시 실행해도 두 번 지급되지 않아요.'
    : '지급을 실행했어요.';
  const missed = receipt.skipped_count + receipt.failed_count;
  if (missed === 0) return `${opening} ${receipt.paid_count}명에게 지급했어요.`;
  return `${opening} ${receipt.paid_count}명에게 지급했고, ${missed}명은 지급되지 않았어요. 아래 보고서에서 확인해 주세요.`;
}

/**
 * The sentence an acknowledgement leaves behind.
 *
 * False is two facts at once -- the alert was already acknowledged, or there
 * is no such alert -- and `admin_acknowledge_alert` draws no line between
 * them. Claiming either one would be inventing the half the database
 * declined to say.
 */
export function acknowledgeMessage(acknowledged: boolean): string {
  return acknowledged
    ? '확인 처리했어요.'
    : '이미 확인됐거나 없는 알림이에요. 목록을 새로 고쳐 확인해 주세요.';
}

/** The sentence a hand-run of the adjustment engine leaves behind. */
export function autoPolicyRunMessage(run: AutoPolicyRun): string {
  if (run.applied === true) {
    const count = (run.adjustments ?? []).length;
    const version = run.version ?? '새 버전';
    return `${version}을(를) 적용했어요. ${count}개 값이 바뀌었습니다.`;
  }
  const blocked = (run.blockedBy ?? []).map(blockedLabel);
  if (blocked.length > 0) return `적용하지 않았어요. ${blocked.join(' ')}`;
  return '적용하지 않았어요. 지금 지표로는 바꿀 값이 없습니다.';
}

/** The sentence a knob change leaves behind, said from what the API returned. */
export interface PolicyKnobSetting {
  readonly knob_key: string;
  readonly auto_adjustable: boolean;
  readonly min_value: string;
  readonly max_value: string;
}

export function knobSettingMessage(setting: PolicyKnobSetting, unit: string): string {
  const automatic = setting.auto_adjustable ? '자동 조정을 켰어요' : '자동 조정을 껐어요';
  const floor = knobValueLabel(setting.min_value, unit);
  const ceiling = knobValueLabel(setting.max_value, unit);
  return `${setting.knob_key}: ${automatic}. 허용 범위는 ${floor} ~ ${ceiling}입니다.`;
}
