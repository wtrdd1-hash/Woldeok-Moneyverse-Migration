import { groupDigits } from '@/lib/money';

/**
 * The item catalogue's vocabulary.
 *
 * The API hands the function's OUT parameters through unchanged -- codes, an
 * effect kind, a purchase-limit token -- and every one of them is English out
 * of a CHECK constraint. So the words a member reads are written here, and
 * the page and its actions read the catalogue through this module.
 *
 * It carries no `server-only` and touches neither the network nor the clock,
 * which is what lets the client controls and the tests import it as it
 * stands.
 */

/**
 * `public.shop_catalog_list` RETURNS TABLE, as it arrives over the wire:
 * packages/database/migrations/075-shop-read-models-and-maintenance.sql.
 *
 * `price` and `maintenance_cost` are `bigint` and stay strings the whole way
 * to the DOM. `quantity` is the stock column and is null for an item with no
 * ceiling -- which is every seeded row today, because 073 ships the whole
 * catalogue with `quantity = NULL` and says why. `sale_ends_at` is a
 * `timestamptz` and reaches the browser as an ISO string.
 */
export interface CatalogItem {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly price: string;
  readonly quantity: number | null;
  readonly purchase_limit: string;
  readonly effect_kind: string;
  readonly maintenance_cost: string;
  readonly sale_ends_at: string | null;
}

/**
 * `public.shop_my_items` RETURNS TABLE: the same migration.
 *
 * `quantity` is a count of things held, not money, so a number is the right
 * type for it. The rule this product enforces is that a balance never becomes
 * a Number, and a count of gloves is not a balance.
 */
export interface HeldItem {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly quantity: number;
  readonly acquired_at: string;
  readonly expires_at: string | null;
  readonly effect_kind: string;
}

/** The receipt `POST /api/v1/shop/catalog/{id}/purchases` answers with. */
export interface PurchaseReceipt {
  readonly purchase_id: string;
  /** `unit_price * quantity`, read back from the stored row by 072. */
  readonly amount: string;
  readonly transaction_id: string;
  readonly replayed: boolean;
}

/**
 * The receipt `POST /api/v1/shop/holdings/{id}/consumptions` answers with.
 *
 * `remaining_quantity` is null on one path only. The replay branch of
 * `shop_use_item` (074) looks the member's row up by the catalogue entry the
 * *receipt* names, and a key spent on some other item finds no row to read a
 * count from. "No row was found for this key" is not the same fact as "none
 * are left", so it is not defaulted to zero.
 */
export interface UseReceipt {
  readonly catalog_id: string;
  readonly remaining_quantity: number | null;
  readonly expires_at: string | null;
  readonly replayed: boolean;
}

/**
 * The six categories 071's CHECK constraint allows, in Korean.
 *
 * A category this build has not been taught keeps its own code rather than
 * disappearing: the page groups by category, and a group with no heading
 * would drop its items off the screen entirely.
 */
const CATEGORY_LABELS: Readonly<Record<string, string>> = Object.freeze({
  general: '생활',
  job: '직업',
  business: '사업',
  vehicle: '이동수단과 임대',
  season: '시즌',
  luxury: '명품',
});

export function categoryLabel(code: string): string {
  return CATEGORY_LABELS[code] ?? code;
}

/**
 * `public.shop_effect_kind`, in Korean.
 *
 * Named for what the enum actually decides rather than for what the words
 * suggest: `shop_use_item` accepts a `convenience` item and refuses the other
 * two, so '사용 가능' is the fact a member needs. Calling it 소모품 would be
 * wrong for 개량 농기구, which is a tool and is also `convenience`.
 */
const EFFECT_LABELS: Readonly<Record<string, string>> = Object.freeze({
  convenience: '사용 가능',
  decoration: '장식',
  display: '전시',
});

export function effectLabel(kind: string): string {
  return EFFECT_LABELS[kind] ?? kind;
}

/** Only a `convenience` item may be consumed; 074 answers 22023 for the rest. */
export function isConsumable(kind: string): boolean {
  return kind === 'convenience';
}

/**
 * The ceiling `shop_purchase_catalog` puts on one call -- `p_quantity NOT
 * BETWEEN 1 AND 100` in 072, mirrored by `@Max(100)` on the request body.
 */
export const PURCHASE_CEILING = 100;

/** The three tokens that cap a member's lifetime holding at one. */
function isSingleHold(limit: string): boolean {
  return limit === 'once' || limit === 'account_one' || limit === 'permanent';
}

interface PeriodLimit {
  readonly period: 'daily' | 'weekly';
  readonly count: number;
}

/**
 * `daily_N` / `weekly_N`, taken apart.
 *
 * `N` is a count of purchases and never an amount, so reading it as a number
 * is safe -- 071's CHECK bounds it at two digits. `daily_0` parses and is
 * refused here, because a cap of zero would render as "하루에 0개까지" and
 * offer a control that cannot succeed.
 */
function periodLimit(limit: string): PeriodLimit | null {
  const match = /^(daily|weekly)_([0-9]{1,2})$/.exec(limit);
  if (match === null) return null;
  const count = Number(match[2]);
  if (!Number.isInteger(count) || count < 1) return null;
  return { period: match[1] === 'daily' ? 'daily' : 'weekly', count };
}

/**
 * How often an item may be bought, in the words a member reads -- or null for
 * a rule the catalogue records but the database does not apply.
 *
 * `shop_assert_purchase_limit` (072) enforces exactly four shapes: `once`,
 * `account_one` and `permanent` cap the lifetime total at one, and `daily_N`
 * / `weekly_N` cap the count inside a Seoul day or week. Its own comment says
 * `level_N`, `stage_based`, `business_owned`, `state_based` and `timed` are
 * accepted and NOT enforced, because they lean on progression and business
 * state that stack does not own yet.
 *
 * Those return null and nothing is drawn. A badge reading "사업을 보유해야 살
 * 수 있어요" would describe a gate that is not there, and a member who
 * believed it would skip a purchase that would in fact go through.
 */
export function purchaseLimitLabel(limit: string): string | null {
  if (isSingleHold(limit)) return '하나만 가질 수 있어요';
  if (limit === 'unlimited') return '구매 횟수 제한이 없어요';

  const period = periodLimit(limit);
  if (period === null) return null;
  return period.period === 'daily'
    ? `하루에 ${period.count}개까지 살 수 있어요`
    : `한 주에 ${period.count}개까지 살 수 있어요`;
}

/**
 * The largest count one submission may ask for.
 *
 * Three ceilings and the smallest wins: the function's own 1..100, the
 * purchase limit where 072 enforces one, and the stock on hand where the
 * catalogue names a number. Zero means the control is not offered at all.
 *
 * This is a bound on one request and not the member's remaining allowance.
 * Nothing readable says how many they already bought today -- `shop_purchases`
 * is revoked from the application role and 075 grants no reader for it -- so
 * a daily cap of two still offers two to somebody who has already spent both,
 * and the database refuses that with 23505. The screen says so in words
 * rather than pretending to a figure it was never sent.
 */
export function maxPurchasable(item: CatalogItem): number {
  const period = periodLimit(item.purchase_limit);
  const byLimit = isSingleHold(item.purchase_limit)
    ? 1
    : period === null
      ? PURCHASE_CEILING
      : Math.min(period.count, PURCHASE_CEILING);

  const stock = item.quantity;
  if (stock === null) return byLimit;
  if (!Number.isInteger(stock) || stock < 0) return 0;
  return Math.min(byLimit, stock);
}

/**
 * Whether holding one already settles the question.
 *
 * Used to show 보유 중 in place of a control that 072 would refuse: the three
 * single-hold tokens count purchases for all time, so a member who holds the
 * item has bought it and cannot buy it again.
 */
export function isHeldToTheLimit(limit: string, held: number): boolean {
  return isSingleHold(limit) && Number.isInteger(held) && held > 0;
}

/**
 * The stock line, or null when the catalogue names no number.
 *
 * Null is the honest answer for an unlimited row, and it is every seeded row
 * today. Printing "무제한" would be a claim about an allocation that 073
 * deliberately left unset until an administrator screen can change it.
 */
export function stockLabel(quantity: number | null): string | null {
  if (quantity === null || !Number.isInteger(quantity) || quantity < 0) return null;
  return quantity === 0 ? '품절' : countLabel(quantity);
}

/**
 * A count of things, in the figures every other number on the screen uses.
 *
 * Anything that is not a whole count is refused rather than rendered: a
 * missing figure printed as `NaN개` claims the member holds NaN of something.
 */
export function countLabel(quantity: number): string {
  if (!Number.isInteger(quantity) || quantity < 0) return '—';
  return `${groupDigits(String(quantity))}개`;
}

/**
 * Whether an item carries the weekly upkeep 075 attached to vehicles and
 * leases.
 *
 * Decided by looking at the digits, not by comparing a number: the column is
 * a `bigint` and arrives as a string, and `Number(maintenance_cost) > 0` is
 * exactly the conversion this codebase does not allow anywhere on an amount.
 */
export function hasUpkeep(maintenanceCost: string): boolean {
  return /^[0-9]+$/.test(maintenanceCost) && /[1-9]/.test(maintenanceCost);
}

/** One category's worth of the catalogue, ready to render as a section. */
export interface CatalogGroup {
  readonly category: string;
  readonly label: string;
  readonly items: readonly CatalogItem[];
}

/**
 * The catalogue in category order.
 *
 * The order is the one the rows arrived in -- `shop_catalog_list` sorts by
 * category, then price, then code -- rather than a list written here. A
 * category added by a later migration therefore lands in the place the
 * database put it instead of falling off the end of a hardcoded order.
 */
export function groupByCategory(items: readonly CatalogItem[]): readonly CatalogGroup[] {
  const groups = new Map<string, CatalogItem[]>();
  for (const item of items) {
    const existing = groups.get(item.category);
    if (existing === undefined) groups.set(item.category, [item]);
    else existing.push(item);
  }
  return [...groups].map(([category, grouped]) => ({
    category,
    label: categoryLabel(category),
    items: grouped,
  }));
}

/**
 * What one purchase is reported as.
 *
 * The figure is the receipt's, never the page's. 072 reads `base_price`
 * inside the transaction that posts the ledger entry and reports the stored
 * row on a replay, so the amount here is what was actually charged even when
 * the card the member clicked was showing yesterday's price.
 */
export function purchaseMessage(receipt: PurchaseReceipt): string {
  const amount = groupDigits(receipt.amount);
  return receipt.replayed
    ? `이미 처리된 구매예요. 결제된 금액은 ${amount} WLD였어요.`
    : `${amount} WLD를 결제했어요. 아래 ‘내 아이템’에서 확인할 수 있어요.`;
}

/** What one consumed item is reported as, from the count the database returned. */
export function useMessage(receipt: UseReceipt): string {
  const remaining = receipt.remaining_quantity;
  if (remaining === null || !Number.isInteger(remaining) || remaining < 0) {
    return receipt.replayed
      ? '이미 사용한 기록이에요. 남은 수량은 지금 확인할 수 없어요.'
      : '아이템을 사용했어요. 남은 수량은 지금 확인할 수 없어요.';
  }
  return receipt.replayed
    ? `이미 사용한 기록이에요. 남은 수량은 ${countLabel(remaining)}예요.`
    : `아이템을 사용했어요. 남은 수량은 ${countLabel(remaining)}예요.`;
}
