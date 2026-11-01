import type {
  NationalPensionOverview, MyPensionAccount, ContributionLog, PayoutLog,
} from './pension-portal-client';

// Only the Nest/PostgreSQL owner-scoped read is authoritative; never coerce unknown
// numeric JSON to a WLD amount or treat a malformed response as an empty history.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(?:0|[1-9][0-9]{0,37})$/;
const DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
const TIERS = new Set(['TIER_1_YOUTH', 'TIER_2_CITIZEN', 'TIER_3_GOLD', 'TIER_4_PLATINUM', 'TIER_5_HONOR']);
const STATUSES = new Set(['ACCUMULATING', 'RETIRED_RECEIVING', 'LIQUIDATED']);

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}
function money(value: unknown): value is string {
  return typeof value === 'string' && WLD.test(value);
}
function uuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value) && value !== '00000000-0000-0000-0000-000000000000';
}
function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function date(value: unknown): value is string {
  return typeof value === 'string' && DATE.test(value) && Number.isFinite(Date.parse(value));
}

export function verifyPensionOverview(raw: unknown): NationalPensionOverview | null {
  const value = record(raw);
  if (!value || !money(value.totalAumWld) || !money(value.totalPensionPaidWld) ||
      !money(value.vaultMainBalanceWld) || !count(value.totalSubscribersCount) ||
      !count(value.totalRetiredReceiversCount) ||
      value.totalRetiredReceiversCount > value.totalSubscribersCount ||
      value.benchmarkAnnualPayoutRate !== null || value.annualPayoutRateCertified !== false) return null;
  return {
    totalAumWld: value.totalAumWld,
    totalPensionPaidWld: value.totalPensionPaidWld,
    vaultMainBalanceWld: value.vaultMainBalanceWld,
    totalSubscribersCount: value.totalSubscribersCount,
    totalRetiredReceiversCount: value.totalRetiredReceiversCount,
    benchmarkAnnualPayoutRate: null,
    annualPayoutRateCertified: false,
  };
}

export function verifyPensionAccount(raw: unknown): MyPensionAccount | null {
  const value = record(raw);
  if (!value || !uuid(value.id) || !uuid(value.user_id) ||
      typeof value.tier !== 'string' || !TIERS.has(value.tier) ||
      typeof value.status !== 'string' || !STATUSES.has(value.status) ||
      !money(value.accumulated_contribution_wld) ||
      !money(value.total_payout_received_wld) ||
      !count(value.total_contributions_count) ||
      !count(value.hourly_payout_rate_bps) || value.hourly_payout_rate_bps < 1 ||
      value.hourly_payout_rate_bps > 10000 ||
      !date(value.created_at) || !date(value.updated_at) ||
      (value.last_payout_at != null && !date(value.last_payout_at)) ||
      (value.retired_at != null && !date(value.retired_at))) return null;
  return {
    id: value.id, user_id: value.user_id, tier: value.tier, status: value.status,
    accumulated_contribution_wld: value.accumulated_contribution_wld,
    total_contributions_count: value.total_contributions_count,
    hourly_payout_rate_bps: value.hourly_payout_rate_bps,
    total_payout_received_wld: value.total_payout_received_wld,
    created_at: value.created_at, updated_at: value.updated_at,
    ...(typeof value.last_payout_at === 'string' ? { last_payout_at: value.last_payout_at } : {}),
    ...(typeof value.retired_at === 'string' ? { retired_at: value.retired_at } : {}),
  };
}

function receipts<T>(
  raw: unknown, parse: (item: Record<string, unknown>) => T | null,
  owner?: { userId: string; accountId: string },
): T[] | null {
  if (!Array.isArray(raw) || raw.length > 20) return null;
  const ids = new Set<string>();
  const output: T[] = [];
  for (const entry of raw) {
    const item = record(entry);
    if (!item || !uuid(item.id) || ids.has(item.id.toLowerCase()) ||
        (owner && (item.user_id !== owner.userId || item.account_id !== owner.accountId))) return null;
    const parsed = parse(item);
    if (!parsed) return null;
    ids.add(item.id.toLowerCase());
    output.push(parsed);
  }
  return output;
}

export function verifyPensionContributions(
  raw: unknown, owner?: { userId: string; accountId: string },
): ContributionLog[] | null {
  return receipts(raw, (item) => {
    if (!uuid(item.id) || !money(item.amount_wld) || item.amount_wld === '0' ||
        typeof item.note !== 'string' || item.note.length > 2000 || !date(item.created_at)) return null;
    return { id: item.id, amount_wld: item.amount_wld, note: item.note, created_at: item.created_at };
  }, owner);
}

export function verifyPensionPayouts(
  raw: unknown, owner?: { userId: string; accountId: string },
): PayoutLog[] | null {
  return receipts(raw, (item) => {
    if (!uuid(item.id) || !money(item.payout_amount_wld) || item.payout_amount_wld === '0' ||
        !money(item.snapshot_accumulated_wld) || !date(item.created_at)) return null;
    return {
      id: item.id, payout_amount_wld: item.payout_amount_wld,
      snapshot_accumulated_wld: item.snapshot_accumulated_wld, created_at: item.created_at,
    };
  }, owner);
}
