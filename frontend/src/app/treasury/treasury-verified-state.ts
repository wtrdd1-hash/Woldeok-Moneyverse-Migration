import 'server-only';

import { publicApi } from '@/lib/api';
import { buildUnverifiedTreasuryState } from './treasury-public-state';
import type { TreasuryOverviewData, TreasuryLedgerItem, UserEligibilityStatus } from './treasury.types';

export interface TreasuryPublicState {
  ok: boolean;
  status: 'RECONCILED' | 'UNVERIFIED';
  code?: 'PUBLIC_TREASURY_RECONCILIATION_PENDING';
  overview: TreasuryOverviewData;
  recentLedger: TreasuryLedgerItem[];
  userEligibility: UserEligibilityStatus;
}

/**
 * Only an independently certified backend Treasury public statement may
 * populate current-period balances. Legacy payments, issuance, beneficiaries
 * and user eligibility have NOT been independently settled; never infer them.
 */
function verifiedCurrentEpoch(snapshot: unknown): Pick<TreasuryOverviewData,
  'verified' | 'totalBalanceWld' | 'availableBalanceWld' | 'safeReserveWld'> | null {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return null;
  const doc = snapshot as Record<string, unknown>;
  if (doc.success !== true || !Array.isArray(doc.vaults)
    || doc.vaults.length < 1 || doc.vaults.length > 25) return null;

  const validAmount = (amount: unknown): amount is string =>
    typeof amount === 'string'
    && amount.length <= 100
    && /^(?:0|[1-9][0-9]*)$/.test(amount);

  if (!validAmount(doc.total_treasury_wld)
    || !validAmount(doc.available_wld) || !validAmount(doc.reserve_wld)) return null;

  const checkedVaults = doc.vaults as unknown[];
  const knownCodes = new Set<string>();
  let sum = 0n;
  for (const item of checkedVaults) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const v = item as Record<string, unknown>;
    if (typeof v.code !== 'string' || !/^VAULT_[A-Z0-9_]{2,40}$/.test(v.code)
      || knownCodes.has(v.code) || !validAmount(v.balance_wld)) return null;
    knownCodes.add(v.code);
    sum += BigInt(v.balance_wld);
  }
  const total = BigInt(doc.total_treasury_wld);
  if (sum !== total
    || BigInt(doc.available_wld) > total
    || BigInt(doc.reserve_wld) > total
    || BigInt(doc.available_wld) + BigInt(doc.reserve_wld) > total) return null;

  // The backend's 0-circulation reserve ratio is legitimately undefined.
  if (doc.reserve_ratio_pct !== null && (
    typeof doc.reserve_ratio_pct !== 'number'
    || !Number.isFinite(doc.reserve_ratio_pct)
    || doc.reserve_ratio_pct < 0)) return null;

  if (typeof doc.timestamp !== 'string') return null;
  const at = Date.parse(doc.timestamp);
  if (!Number.isFinite(at) || at > Date.now() + 5000 || Date.now() - at > 300000) return null;

  return {
    verified: true,
    totalBalanceWld: doc.total_treasury_wld,
    availableBalanceWld: doc.available_wld,
    safeReserveWld: doc.reserve_wld,
  };
}

export async function loadTreasuryPublicState(isLoggedIn: boolean): Promise<TreasuryPublicState> {
  const unknown = buildUnverifiedTreasuryState(isLoggedIn);
  let snapshot: unknown = null;
  try {
    // Public API has no forwarded member credentials, is same for all users,
    // and performs an independent DB-owned fiscal proof on every request.
    snapshot = await publicApi<unknown>('/api/v1/treasury/public-overview', 0);
  } catch {
    // Failure of the backend remains UNVERIFIED, never stale or fabricated 0.
  }
  const certified = verifiedCurrentEpoch(snapshot);
  if (!certified) {
    return {
      ok: false, status: 'UNVERIFIED',
      code: 'PUBLIC_TREASURY_RECONCILIATION_PENDING',
      ...unknown,
    };
  }

  return {
    ok: true, status: 'RECONCILED',
    overview: { ...unknown.overview, ...certified },
    recentLedger: [], // Historic payouts have no certified canonical receipt.
    userEligibility: unknown.userEligibility, // Payments remain explicitly unavailable.
  };
}
