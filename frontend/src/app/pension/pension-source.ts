import { canonicalIntegerString } from '@/lib/money';
import type {
  ContributionLog,
  MyPensionAccount,
  NationalPensionOverview,
  PayoutLog,
} from './pension-portal-client';

export interface PensionSourceEvidence {
  readonly account: boolean;
  readonly contributions: boolean;
  readonly payouts: boolean;
  readonly wallet: boolean;
}

export interface PensionMemberEvidence {
  readonly account: MyPensionAccount | null;
  readonly contributions: ContributionLog[];
  readonly payouts: PayoutLog[];
  readonly cashBalance: string | null;
  readonly sourceEvidence: PensionSourceEvidence;
  readonly isLoggedIn: boolean;
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const tiers = new Set(['TIER_1_YOUTH', 'TIER_2_CITIZEN', 'TIER_3_GOLD', 'TIER_4_PLATINUM', 'TIER_5_HONOR']);
const statuses = new Set(['ACCUMULATING', 'RETIRED_RECEIVING', 'LIQUIDATED']);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function id(value: unknown): value is string {
  return typeof value === 'string' && uuid.test(value) && value !== '00000000-0000-0000-0000-000000000000';
}

function money(value: unknown): string | null {
  const canonical = canonicalIntegerString(value);
  return canonical !== null && !canonical.startsWith('-') ? canonical : null;
}

function time(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

function count(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function parseAccount(value: unknown): MyPensionAccount | null {
  if (!record(value) || !id(value.id) || !id(value.user_id) ||
      !tiers.has(String(value.tier)) || !statuses.has(String(value.status)) ||
      money(value.accumulated_contribution_wld) === null ||
      money(value.total_payout_received_wld) === null ||
      !count(value.total_contributions_count) ||
      !count(value.hourly_payout_rate_bps) || value.hourly_payout_rate_bps > 10000 ||
      !time(value.created_at) || !time(value.updated_at) ||
      (value.last_payout_at != null && !time(value.last_payout_at)) ||
      (value.retired_at != null && !time(value.retired_at))) return null;
  return {
    id: value.id, user_id: value.user_id,
    tier: value.tier as string, status: value.status as string,
    accumulated_contribution_wld: money(value.accumulated_contribution_wld)!,
    total_contributions_count: value.total_contributions_count,
    hourly_payout_rate_bps: value.hourly_payout_rate_bps,
    total_payout_received_wld: money(value.total_payout_received_wld)!,
    created_at: value.created_at, updated_at: value.updated_at,
    ...(time(value.last_payout_at) ? { last_payout_at: value.last_payout_at } : {}),
    ...(time(value.retired_at) ? { retired_at: value.retired_at } : {}),
  };
}

type ReceiptKind = 'contributions' | 'payouts';

function parseReceipts<T extends ReceiptKind>(
  value: unknown, kind: T, account: MyPensionAccount | null, expectedOwner: string | null,
): (T extends 'contributions' ? ContributionLog[] : PayoutLog[]) | null {
  if (!Array.isArray(value) || value.length > 20) return null;
  const seen = new Set<string>();
  let owner: string | null = null;
  let accountId: string | null = null;
  const output: Array<ContributionLog | PayoutLog> = [];
  for (const row of value) {
    if (!record(row) || !id(row.id) || !id(row.account_id) || !id(row.user_id) ||
        !time(row.created_at) || seen.has(row.id)) return null;
    if (owner !== null && row.user_id !== owner) return null;
    if (accountId !== null && row.account_id !== accountId) return null;
    if (account && (row.user_id !== account.user_id || row.account_id !== account.id)) return null;
    if (expectedOwner !== null && row.user_id !== expectedOwner) return null;
    seen.add(row.id);
    owner = row.user_id;
    accountId = row.account_id;
    if (kind === 'contributions') {
      const amount = money(row.amount_wld);
      if (amount === null || amount === '0' || typeof row.note !== 'string' || row.note.length > 1000) return null;
      output.push({ id: row.id, amount_wld: amount, note: row.note, created_at: row.created_at });
    } else {
      const amount = money(row.payout_amount_wld);
      const snapshot = money(row.snapshot_accumulated_wld);
      if (amount === null || amount === '0' || snapshot === null) return null;
      output.push({ id: row.id, payout_amount_wld: amount, snapshot_accumulated_wld: snapshot, created_at: row.created_at });
    }
  }
  return output as T extends 'contributions' ? ContributionLog[] : PayoutLog[];
}

function parseWallet(value: unknown): { ownerId: string; cashBalance: string } | null {
  if (!record(value) || !id(value.userId) || !record(value.balances) ||
      value.balances.currency !== 'WLD' || !record(value.balances.cash) ||
      !record(value.balances.bank) || !time(value.balances.cash.updatedAt) ||
      !time(value.balances.bank.updatedAt)) return null;
  const cash = money(value.balances.cash.availableAmount);
  const bank = money(value.balances.bank.availableAmount);
  const total = money(value.balances.totalAvailableAmount);
  if (cash === null || bank === null || total === null ||
      BigInt(cash) + BigInt(bank) !== BigInt(total)) return null;
  return { ownerId: value.userId, cashBalance: cash };
}

export function parsePensionOverview(value: unknown): NationalPensionOverview | null {
  if (!record(value) || money(value.totalAumWld) === null ||
      money(value.totalPensionPaidWld) === null || money(value.vaultMainBalanceWld) === null ||
      !count(value.totalSubscribersCount) || !count(value.totalRetiredReceiversCount) ||
      value.totalRetiredReceiversCount > value.totalSubscribersCount ||
      value.annualPayoutRateCertified !== false || value.benchmarkAnnualPayoutRate !== null) return null;
  return {
    totalAumWld: money(value.totalAumWld)!,
    totalSubscribersCount: value.totalSubscribersCount,
    totalRetiredReceiversCount: value.totalRetiredReceiversCount,
    totalPensionPaidWld: money(value.totalPensionPaidWld)!,
    vaultMainBalanceWld: money(value.vaultMainBalanceWld)!,
    benchmarkAnnualPayoutRate: null,
    annualPayoutRateCertified: false,
  };
}

/** Each owner-scoped read remains useful when a different pension endpoint is unavailable. */
export async function loadPensionMemberEvidence(
  read: (path: string) => Promise<unknown>,
): Promise<PensionMemberEvidence> {
  const paths = [
    '/api/v1/pension/my-account',
    '/api/v1/pension/my-contributions',
    '/api/v1/pension/my-payouts',
    '/api/v1/wallet?recent=1',
  ] as const;
  const [accountResult, contributionResult, payoutResult, walletResult] =
    await Promise.allSettled([
      read(paths[0]), read(paths[1]), read(paths[2]), read(paths[3]),
    ]);
  const wallet = walletResult.status === 'fulfilled' ? parseWallet(walletResult.value) : null;
  let account = accountResult.status === 'fulfilled' ? parseAccount(accountResult.value) : null;
  const ownerConflict = wallet !== null && account !== null && wallet.ownerId !== account.user_id;
  if (ownerConflict) account = null;
  const expectedOwner = wallet?.ownerId ?? account?.user_id ?? null;
  let contributions = contributionResult.status === 'fulfilled'
    ? parseReceipts(contributionResult.value, 'contributions', account, expectedOwner) : null;
  let payouts = payoutResult.status === 'fulfilled'
    ? parseReceipts(payoutResult.value, 'payouts', account, expectedOwner) : null;
  if (ownerConflict) {
    contributions = null;
    payouts = null;
  }
  // The session-bound SQL functions are authoritative; cross-list agreement
  // also prevents rendering conflicting owner evidence when the account read fails.
  if (!account && contributions && payouts && contributions.length && payouts.length &&
      contributionResult.status === 'fulfilled' && payoutResult.status === 'fulfilled') {
    const contributionRows = contributionResult.value as Record<string, unknown>[];
    const payoutRows = payoutResult.value as Record<string, unknown>[];
    if (contributionRows[0]?.user_id !== payoutRows[0]?.user_id ||
        contributionRows[0]?.account_id !== payoutRows[0]?.account_id) {
      contributions = null;
      payouts = null;
    }
  }
  const cashBalance = wallet?.cashBalance ?? null;
  const sourceEvidence = {
    account: account !== null,
    contributions: contributions !== null,
    payouts: payouts !== null,
    wallet: cashBalance !== null,
  };
  return {
    account,
    contributions: contributions ?? [],
    payouts: payouts ?? [],
    cashBalance,
    sourceEvidence,
    isLoggedIn: Object.values(sourceEvidence).some(Boolean),
  };
}
