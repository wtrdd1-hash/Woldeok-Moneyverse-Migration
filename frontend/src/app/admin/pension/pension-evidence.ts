import type { NationalPensionOverview, PayoutLogItem } from './pension-control-tower';

const unsignedWld = /^(0|[1-9]\d*)$/;
const signedWld = /^-?(0|[1-9]\d*)$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const rate = /^(?:0|[1-9]\d{0,2})(?:\.\d{1,2})?%$/;

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}
function wld(value: unknown, signed = false): value is string {
  return typeof value === 'string' && (signed ? signedWld : unsignedWld).test(value);
}
function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

export function parsePensionOverview(value: unknown): NationalPensionOverview | null {
  const data = record(value);
  if (!data ||
    !wld(data.totalAumWld) ||
    !wld(data.totalPensionPaidWld) ||
    !wld(data.vaultMainBalanceWld, true) ||
    !count(data.totalSubscribersCount) ||
    !count(data.totalRetiredReceiversCount) ||
    data.totalRetiredReceiversCount > data.totalSubscribersCount ||
    typeof data.benchmarkAnnualPayoutRate !== 'string' ||
    !rate.test(data.benchmarkAnnualPayoutRate)
  ) return null;
  return {
    totalAumWld: data.totalAumWld,
    totalSubscribersCount: data.totalSubscribersCount,
    totalRetiredReceiversCount: data.totalRetiredReceiversCount,
    totalPensionPaidWld: data.totalPensionPaidWld,
    benchmarkAnnualPayoutRate: data.benchmarkAnnualPayoutRate,
    vaultMainBalanceWld: data.vaultMainBalanceWld,
  };
}

export function parsePensionPayoutLogs(value: unknown): PayoutLogItem[] | null {
  if (!Array.isArray(value) || value.length > 30) return null;
  const ids = new Set<string>();
  const result: PayoutLogItem[] = [];
  for (const item of value) {
    const data = record(item);
    if (!data ||
      typeof data.id !== 'string' || !uuid.test(data.id) || ids.has(data.id) ||
      typeof data.account_id !== 'string' || !uuid.test(data.account_id) ||
      typeof data.user_id !== 'string' || !uuid.test(data.user_id) ||
      !wld(data.payout_amount_wld) ||
      !wld(data.snapshot_accumulated_wld) ||
      typeof data.created_at !== 'string' ||
      !/^\d{4}-\d\d-\d\dT/.test(data.created_at) ||
      !Number.isFinite(Date.parse(data.created_at))
    ) return null;
    ids.add(data.id);
    result.push({
      id: data.id,
      account_id: data.account_id,
      user_id: data.user_id,
      payout_amount_wld: data.payout_amount_wld,
      snapshot_accumulated_wld: data.snapshot_accumulated_wld,
      created_at: data.created_at,
    });
  }
  return result;
}
