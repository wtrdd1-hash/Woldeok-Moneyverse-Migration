import type { EarlyUnlock } from '@/app/progression/unlocks';
import type { EquityStanding } from './equity';

export interface BusinessType {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly description: string;
  readonly purchaseCost: string;
  readonly dailyRevenue: string;
  readonly dailyOperatingCost: string;
}

export interface OwnershipV2 extends Omit<BusinessType, 'id'> {
  readonly ownershipId: string;
  readonly businessTypeId: string;
  readonly purchasedAt: string;
  readonly lastSettlementDate: string | null;
  readonly isSettledToday: boolean;
  readonly boostActive: Record<string, unknown> | null;
  readonly status: string;
}

export interface InventoryItem {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly quantity: number;
}

type Row = Record<string, unknown>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const AMOUNT = /^(0|[1-9][0-9]*)$/;
const SIGNED_AMOUNT = /^-?(0|[1-9][0-9]*)$/;

function object(input: unknown): Row | null {
  return input !== null && typeof input === 'object' && !Array.isArray(input)
    ? input as Row : null;
}
function label(input: unknown, allowEmpty = false): input is string {
  return typeof input === 'string' && input.length <= 512 && (allowEmpty || input.trim().length > 0);
}
function amount(input: unknown, signed = false): input is string {
  return typeof input === 'string' && (signed ? SIGNED_AMOUNT : AMOUNT).test(input);
}
function count(input: unknown, max = Number.MAX_SAFE_INTEGER): input is number {
  return typeof input === 'number' && Number.isSafeInteger(input) && input >= 0 && input <= max;
}
function uuid(input: unknown): input is string {
  return typeof input === 'string' && UUID.test(input);
}
function iso(input: unknown): input is string {
  return typeof input === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(input) &&
    Number.isFinite(Date.parse(input)) && new Date(input).toISOString() === input;
}
function day(input: unknown): input is string {
  if (typeof input !== 'string') return false;
  // The Nest service currently String()s pg DATE values; node-postgres may
  // return either YYYY-MM-DD or a JavaScript Date string.
  if (/^[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \(/.test(input)) {
    return Number.isFinite(Date.parse(input));
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return false;
  const parsed = new Date(input + 'T00:00:00.000Z');
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === input;
}
function unique<T>(items: T[], key: (item: T) => string): boolean {
  return new Set(items.map(key)).size === items.length;
}
function rows<T>(input: unknown, parse: (row: unknown) => T | null, limit: number): T[] | null {
  if (!Array.isArray(input) || input.length > limit) return null;
  const result = input.map(parse);
  return result.every((item): item is T => item !== null) ? result : null;
}

function businessType(input: unknown): BusinessType | null {
  const r = object(input);
  if (!r || !uuid(r.id) || !label(r.symbol) || !label(r.name) || !label(r.description, true) ||
    !amount(r.purchaseCost) || !amount(r.dailyRevenue) || !amount(r.dailyOperatingCost)) return null;
  return {
    id: r.id, symbol: r.symbol, name: r.name, description: r.description,
    purchaseCost: r.purchaseCost, dailyRevenue: r.dailyRevenue, dailyOperatingCost: r.dailyOperatingCost,
  };
}

function ownership(input: unknown): OwnershipV2 | null {
  const r = object(input);
  if (!r || !uuid(r.ownershipId) || !uuid(r.businessTypeId) ||
    !label(r.symbol) || !label(r.name) || !label(r.description, true) ||
    !amount(r.purchaseCost) || !amount(r.dailyRevenue) || !amount(r.dailyOperatingCost) ||
    !iso(r.purchasedAt) || !(r.lastSettlementDate === null || day(r.lastSettlementDate)) ||
    typeof r.isSettledToday !== 'boolean' ||
    !(r.boostActive === null || object(r.boostActive) !== null) ||
    !['active', 'paused', 'suspended', 'closed'].includes(String(r.status))) return null;
  return {
    ownershipId: r.ownershipId, businessTypeId: r.businessTypeId,
    symbol: r.symbol, name: r.name, description: r.description,
    purchaseCost: r.purchaseCost, dailyRevenue: r.dailyRevenue,
    dailyOperatingCost: r.dailyOperatingCost, purchasedAt: r.purchasedAt,
    lastSettlementDate: r.lastSettlementDate, isSettledToday: r.isSettledToday,
    boostActive: r.boostActive as Record<string, unknown> | null, status: r.status as string,
  };
}

/** A null read means unavailable or invalid, never an empty portfolio. */
export function parseBusinessOwnerships(input: unknown): OwnershipV2[] | null {
  const r = object(input);
  const list = rows(r?.businesses, ownership, 1000);
  return list && unique(list, (item) => item.ownershipId) &&
    unique(list, (item) => item.businessTypeId) ? list : null;
}

export function parseBusinessCatalog(input: unknown): BusinessType[] | null {
  const r = object(input);
  const list = rows(r?.businessTypes, businessType, 1000);
  return list && unique(list, (item) => item.id) && unique(list, (item) => item.symbol) ? list : null;
}

export function parseBusinessEquity(input: unknown): EquityStanding | null {
  const r = object(object(input)?.equity);
  if (!r || !amount(r.holdingsAmount) || !amount(r.debtAmount) ||
    !amount(r.equityAmount, true) || !count(r.minimumRatioBps, 10000)) return null;
  return {
    holdingsAmount: r.holdingsAmount, debtAmount: r.debtAmount,
    equityAmount: r.equityAmount, minimumRatioBps: r.minimumRatioBps,
  };
}

function inventoryItem(input: unknown): InventoryItem | null {
  const r = object(input);
  if (!r || !uuid(r.catalog_id) || !label(r.code) || !label(r.name) ||
    !label(r.description, true) || !label(r.category) || !count(r.quantity)) return null;
  return { id: r.catalog_id as string, code: r.code, name: r.name, description: r.description, category: r.category, quantity: r.quantity };
}

export function parseBusinessInventory(input: unknown): InventoryItem[] | null {
  const r = object(input);
  const list = rows(r?.holdings, inventoryItem, 5000);
  return list && unique(list, (item) => item.id) ? list : null;
}

function unlock(input: unknown): EarlyUnlock | null {
  const r = object(input);
  if (!r || !label(r.unlock_code) || !label(r.unlock_label) ||
    !label(r.unlock_detail, true) ||
    !(r.unlock_business_symbol === null || label(r.unlock_business_symbol)) ||
    typeof r.is_enforced !== 'boolean' || typeof r.unlocked !== 'boolean' ||
    typeof r.next_up !== 'boolean') return null;
  const fields = ['needs_job_level', 'needs_account_days', 'needs_work_completions',
    'member_job_level', 'member_account_days', 'member_work_completions'] as const;
  if (!fields.every((key) => count(r[key]))) return null;
  return r as unknown as EarlyUnlock;
}

export function parseBusinessUnlocks(input: unknown): EarlyUnlock[] | null {
  const r = object(input);
  const list = rows(r?.unlocks, unlock, 1000);
  return list && unique(list, (item) => item.unlock_code) ? list : null;
}
