import type { CatalogItem, HeldItem } from './catalog';

/** Boundary for the authenticated NestJS shop read models (SQL SECURITY DEFINER). */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MONEY = /^(0|[1-9][0-9]*)$/;
const MAX_BIGINT = 9223372036854775807n;
const CODE = /^[a-z0-9_]{3,64}$/;
const LIMIT =
  /^(once|account_one|permanent|unlimited|limited|business_owned|state_based|stage_based|timed|level_[0-9]{1,2}|daily_[0-9]{1,2}|weekly_[0-9]{1,2})$/;
const CATEGORIES = new Set(['general', 'job', 'business', 'vehicle', 'season', 'luxury']);
const EFFECTS = new Set(['convenience', 'decoration', 'display']);
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function text(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 5000;
}
function money(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= 19 &&
    MONEY.test(value) &&
    BigInt(value) <= MAX_BIGINT
  );
}
function count(value: unknown, minimum = 0): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= minimum;
}
function time(value: unknown): value is string {
  return typeof value === 'string' && ISO_TIME.test(value) && Number.isFinite(Date.parse(value));
}
function optionalTime(value: unknown): value is string | null {
  return value === null || time(value);
}
function identity(value: Record<string, unknown>): boolean {
  return (
    typeof value.catalog_id === 'string' &&
    UUID.test(value.catalog_id) &&
    typeof value.code === 'string' &&
    CODE.test(value.code) &&
    text(value.name)
  );
}

function isCatalogItem(value: unknown): value is CatalogItem {
  if (!record(value) || !identity(value)) return false;
  return (
    typeof value.description === 'string' &&
    value.description.length <= 5000 &&
    typeof value.category === 'string' &&
    CATEGORIES.has(value.category) &&
    money(value.price) &&
    value.price !== '0' &&
    (value.quantity === null || count(value.quantity)) &&
    typeof value.purchase_limit === 'string' &&
    LIMIT.test(value.purchase_limit) &&
    typeof value.effect_kind === 'string' &&
    EFFECTS.has(value.effect_kind) &&
    money(value.maintenance_cost) &&
    optionalTime(value.sale_ends_at)
  );
}

function isHeldItem(value: unknown): value is HeldItem {
  if (!record(value) || !identity(value)) return false;
  return (
    count(value.quantity, 1) &&
    time(value.acquired_at) &&
    optionalTime(value.expires_at) &&
    typeof value.effect_kind === 'string' &&
    EFFECTS.has(value.effect_kind) &&
    typeof value.durable === 'boolean' &&
    money(value.weekly_cost) &&
    optionalTime(value.effect_expires_at) &&
    count(value.unpaid_weeks) &&
    money(value.arrears_due) &&
    money(value.arrears_cap) &&
    typeof value.suspended === 'boolean'
  );
}

function verifiedRows<T>(
  value: unknown,
  key: string,
  check: (row: unknown) => row is T,
): readonly T[] | null {
  if (!record(value) || !Array.isArray(value[key])) return null;
  const rows: unknown[] = value[key];
  const ids = new Set<string>();
  const codes = new Set<string>();
  for (const row of rows) {
    if (!check(row)) return null;
    const id = (row as { catalog_id: string }).catalog_id.toLowerCase();
    const code = (row as { code: string }).code;
    if (ids.has(id) || codes.has(code)) return null;
    ids.add(id);
    codes.add(code);
  }
  return rows as T[];
}

/** Invalid source != verified empty. Never show purchase controls from an invalid source. */
export function verifiedCatalog(
  value: unknown,
): { readonly catalogItems: readonly CatalogItem[] } | null {
  const catalogItems = verifiedRows(value, 'catalogItems', isCatalogItem);
  return catalogItems === null ? null : { catalogItems };
}

/** Owner-only holdings are not inferred from catalogue stock or browser state. */
export function verifiedHoldings(
  value: unknown,
): { readonly holdings: readonly HeldItem[] } | null {
  const holdings = verifiedRows(value, 'holdings', isHeldItem);
  return holdings === null ? null : { holdings };
}

/** Next searchParams are untrusted: repeated/bracketed keys can be arrays or objects. */
export function normalizeCatalogQuery(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 80).toLocaleLowerCase('ko-KR') : '';
}
