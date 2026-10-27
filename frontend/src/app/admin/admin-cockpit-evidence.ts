import type { AdminUser } from './types';
import { canonicalIntegerString, compareAmounts } from '@/lib/money';

type Unavailable = { readonly state: 'unavailable' };
type VerifiedControls = { readonly state: 'verified'; readonly held: number; readonly total: number };
type VerifiedStocks = { readonly state: 'verified'; readonly active: number; readonly halted: number };
type VerifiedMembers = { readonly state: 'verified'; readonly sampledCount: number; readonly top: readonly AdminUser[] };
type LedgerState = Unavailable | { readonly state: 'verified'; readonly calculatedAt: string } | { readonly state: 'mismatch'; readonly calculatedAt: string };

export interface CockpitEvidence {
  readonly controls: Unavailable | VerifiedControls;
  readonly stocks: Unavailable | VerifiedStocks;
  readonly members: Unavailable | VerifiedMembers;
  readonly ledger: LedgerState;
  readonly allVerified: boolean;
}

const unavailable = { state: 'unavailable' } as const;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const switchStates = new Set(['enabled', 'paused', 'safe_mode', 'disabled']);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function integerString(value: unknown): value is string {
  return typeof value === 'string' && canonicalIntegerString(value) === value;
}

function validMember(value: unknown): value is AdminUser {
  if (!record(value)) return false;
  return typeof value.user_id === 'string' && uuidPattern.test(value.user_id)
    && typeof value.display_name === 'string' && value.display_name.trim().length > 0
    && typeof value.status === 'string' && typeof value.created_at === 'string'
    && integerString(value.total_net_worth)
    && typeof value.is_admin === 'boolean'
    && (value.wealth_rank === null || (typeof value.wealth_rank === 'number'
      && Number.isSafeInteger(value.wealth_rank) && value.wealth_rank > 0));
}

function controlsEvidence(value: unknown): Unavailable | VerifiedControls {
  if (!record(value) || !Array.isArray(value.featureSwitches)) return unavailable;
  const seen = new Set<string>();
  let held = 0;
  for (const item of value.featureSwitches as unknown[]) {
    if (!record(item) || typeof item.feature_key !== 'string' || !item.feature_key
      || seen.has(item.feature_key) || !switchStates.has(String(item.state))) return unavailable;
    seen.add(item.feature_key);
    if (item.state !== 'enabled') held += 1;
  }
  return { state: 'verified', held, total: seen.size };
}

function stocksEvidence(value: unknown): Unavailable | VerifiedStocks {
  if (!record(value) || !Array.isArray(value.stocks)) return unavailable;
  const seen = new Set<string>();
  let active = 0;
  let halted = 0;
  for (const item of value.stocks as unknown[]) {
    if (!record(item) || typeof item.id !== 'string' || !uuidPattern.test(item.id)
      || seen.has(item.id) || typeof item.active !== 'boolean'
      || (item.halt_status !== undefined && typeof item.halt_status !== 'string')) return unavailable;
    seen.add(item.id);
    if (item.active && item.halt_status !== 'halted') active += 1;
    else halted += 1;
  }
  return { state: 'verified', active, halted };
}

function membersEvidence(value: unknown): Unavailable | VerifiedMembers {
  if (!record(value) || !Array.isArray(value.users) || value.users.length > 200) return unavailable;
  const seen = new Set<string>();
  const members: AdminUser[] = [];
  for (const item of value.users as unknown[]) {
    if (!validMember(item) || seen.has(item.user_id)) return unavailable;
    seen.add(item.user_id);
    if (!item.is_admin && !item.last_admin_at) members.push(item);
  }
  members.sort((a, b) => compareAmounts(b.total_net_worth!, a.total_net_worth!));
  return { state: 'verified', sampledCount: value.users.length, top: members.slice(0, 5) };
}

function ledgerEvidence(value: unknown): LedgerState {
  if (!record(value) || value.available !== true || !record(value.integrity)) return unavailable;
  const integrity = value.integrity;
  if (typeof integrity.ok !== 'boolean'
    || !integerString(integrity.unbalancedTransactionCount)
    || !integerString(integrity.balanceMismatchAccountCount)
    || !integerString(integrity.balanceTotalDeltaAmount)
    || !integerString(integrity.ledgerTransactionCount)
    || typeof value.calculatedAt !== 'string' || !Number.isFinite(Date.parse(value.calculatedAt))) return unavailable;
  const zeroErrors = integrity.unbalancedTransactionCount === '0'
    && integrity.balanceMismatchAccountCount === '0'
    && integrity.balanceTotalDeltaAmount === '0';
  if (integrity.ok && !zeroErrors) return unavailable;
  return integrity.ok ? { state: 'verified', calculatedAt: value.calculatedAt as string } : { state: 'mismatch', calculatedAt: value.calculatedAt as string };
}

/** The root dashboard must not convert a failed bounded read into global or healthy claims. */
export function getCockpitEvidence(data: {
  readonly controls: unknown;
  readonly stocks: unknown;
  readonly users: unknown;
  readonly health: unknown;
}): CockpitEvidence {
  const controls = controlsEvidence(data.controls);
  const stocks = stocksEvidence(data.stocks);
  const members = membersEvidence(data.users);
  const ledger = ledgerEvidence(data.health);
  return {
    controls, stocks, members, ledger,
    allVerified: controls.state === 'verified' && stocks.state === 'verified'
      && members.state === 'verified' && ledger.state === 'verified',
  };
}
