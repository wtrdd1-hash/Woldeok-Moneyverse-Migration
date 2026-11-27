import { formatDay, groupDigits } from '@/lib/money';
import { pick, type Copy } from '@/lib/copy';
import { fill } from '@/lib/copy-format';
import type { Locale } from '@/lib/locale';
import { COPY } from './copy';

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
 * `public.shop_my_items` RETURNS TABLE:
 * packages/database/migrations/104-item-lifecycle.sql.
 *
 * `quantity` and `unpaid_weeks` are counts of things, not money, so a number
 * is the right type for them. The rule this product enforces is that a
 * balance never becomes a Number, and a count of gloves is not a balance —
 * `weekly_cost`, `arrears_due` and `arrears_cap` are `bigint` and stay
 * strings the whole way to the DOM.
 *
 * `expires_at` and `effect_expires_at` are two different clocks and neither
 * substitutes for the other. A 배달 계약 runs out seven days after it is
 * bought whether or not anybody touched it; a 시장 분석권 is spent and then
 * runs for seven days from the moment it was spent.
 */
export interface HeldItem {
  readonly catalog_id: string;
  readonly code: string;
  readonly name: string;
  readonly quantity: number;
  readonly acquired_at: string;
  readonly expires_at: string | null;
  readonly effect_kind: string;
  /** Carries a term or an upkeep, so 104 refuses to consume it. */
  readonly durable: boolean;
  readonly weekly_cost: string;
  readonly effect_expires_at: string | null;
  readonly unpaid_weeks: number;
  readonly arrears_due: string;
  /** Where the debt stops: four weeks of this holding's upkeep, spec 16.4. */
  readonly arrears_cap: string;
  readonly suspended: boolean;
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
 * The receipt `POST /api/v1/shop/holdings/{id}/upkeep-settlements` answers
 * with.
 *
 * `paid_amount` is the capped figure `shop_settle_upkeep` read inside the
 * transaction that posted it, never one this page sent — so it is what was
 * actually charged even when the card had been open since before Monday.
 */
export interface SettlementReceipt {
  readonly paid_amount: string;
  readonly ledger_transaction_id: string;
  readonly replayed: boolean;
}

/**
 * The six categories 071's CHECK constraint allows, in Korean.
 *
 * A category this build has not been taught keeps its own code rather than
 * disappearing: the page groups by category, and a group with no heading
 * would drop its items off the screen entirely.
 */
const CATEGORY_LABELS: Readonly<Record<string, Copy>> = Object.freeze({
  general: COPY.categoryGeneral,
  job: COPY.categoryJob,
  business: COPY.categoryBusiness,
  vehicle: COPY.categoryVehicle,
  season: COPY.categorySeason,
  luxury: COPY.categoryLuxury,
});

/*
 * Every label helper takes the reader's locale and answers in Korean when it is omitted, the
 * convention `formatDay` already follows; page callers always pass the request locale.
 */
export function categoryLabel(code: string, locale: Locale = 'ko'): string {
  const copy = CATEGORY_LABELS[code];
  return copy === undefined ? code : pick(locale, copy);
}

/**
 * `public.shop_effect_kind`, in Korean.
 *
 * Named for what the enum actually decides rather than for what the words
 * suggest: `shop_use_item` accepts a `convenience` item and refuses the other
 * two, so '사용 가능' is the fact a member needs. Calling it 소모품 would be
 * wrong for 개량 농기구, which is a tool and is also `convenience`.
 */
const EFFECT_LABELS: Readonly<Record<string, Copy>> = Object.freeze({
  convenience: COPY.effectConvenience,
  decoration: COPY.effectDecoration,
  display: COPY.effectDisplay,
});

export function effectLabel(kind: string, locale: Locale = 'ko'): string {
  const copy = EFFECT_LABELS[kind];
  return copy === undefined ? kind : pick(locale, copy);
}

/** Only a `convenience` item may be consumed; 074 answers 22023 for the rest. */
export function isConsumable(kind: string): boolean {
  return kind === 'convenience';
}

/**
 * Whether the 사용하기 control belongs on a holding at all.
 *
 * A durable item — one the catalogue gives a term or a weekly upkeep — is
 * refused by 104 with 22023. Every useful thing in the catalogue is
 * `convenience`, vehicles and leases included, so without this the button
 * that destroys a 45,000 WLD 소형 화물차 sits on its card.
 */
export function isUsable(item: HeldItem): boolean {
  return isConsumable(item.effect_kind) && !item.durable;
}

/** Whether the weekly upkeep has fallen behind on this holding. */
export function owesUpkeep(item: HeldItem): boolean {
  return hasUpkeep(item.arrears_due);
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
export function purchaseLimitLabel(limit: string, locale: Locale = 'ko'): string | null {
  if (isSingleHold(limit)) return pick(locale, COPY.limitSingle);
  if (limit === 'unlimited') return pick(locale, COPY.limitUnlimited);

  const period = periodLimit(limit);
  if (period === null) return null;
  return pick(locale, fill(period.period === 'daily' ? COPY.limitDaily : COPY.limitWeekly, { count: period.count }));
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
export function stockLabel(quantity: number | null, locale: Locale = 'ko'): string | null {
  if (quantity === null || !Number.isInteger(quantity) || quantity < 0) return null;
  return quantity === 0 ? pick(locale, COPY.soldOut) : countLabel(quantity, locale);
}

/**
 * A count of things, in the figures every other number on the screen uses.
 *
 * Anything that is not a whole count is refused rather than rendered: a
 * missing figure printed as `NaN개` claims the member holds NaN of something.
 */
export function countLabel(quantity: number, locale: Locale = 'ko'): string {
  if (!Number.isInteger(quantity) || quantity < 0) return '—';
  return pick(locale, fill(COPY.count, { count: groupDigits(String(quantity)) }));
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
export function filterCatalogByCategory(items: readonly CatalogItem[], category: string): CatalogItem[] {
  return category === '' ? [...items] : items.filter((item) => item.category === category);
}

export function groupByCategory(items: readonly CatalogItem[], locale: Locale = 'ko'): readonly CatalogGroup[] {
  const groups = new Map<string, CatalogItem[]>();
  for (const item of items) {
    const existing = groups.get(item.category);
    if (existing === undefined) groups.set(item.category, [item]);
    else existing.push(item);
  }
  return [...groups].map(([category, grouped]) => ({
    category,
    label: categoryLabel(category, locale),
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

/** A count of weeks, refused rather than rendered when it is not a count. */
export function weeksLabel(weeks: number, locale: Locale = 'ko'): string {
  if (!Number.isInteger(weeks) || weeks < 0) return '—';
  return pick(locale, fill(COPY.weeks, { weeks }));
}

/**
 * The sentence a holding gets in place of a control, or null when a control
 * belongs there instead.
 *
 * Every branch names a refusal 104 would actually make, so the screen never
 * offers a button whose only possible answer is a conflict. Null comes back
 * for two different situations — arrears to settle, and an item that can be
 * used — and the page picks between them, because the page is the only place
 * that holds both controls.
 */
export function holdingNote(item: HeldItem, locale: Locale = 'ko'): string | null {
  if (owesUpkeep(item)) return null;
  if (item.durable) {
    return pick(locale, hasUpkeep(item.weekly_cost) ? COPY.noteUpkeepDurable : COPY.noteFixedTerm);
  }
  if (!isConsumable(item.effect_kind)) {
    return pick(locale, COPY.noteDecoration);
  }
  if (item.effect_expires_at !== null) {
    // Chapter 20's 중복 방지. 104 answers 23505 for a second use while the
    // first is still running, so the date is the thing worth saying.
    const until = formatDay(item.effect_expires_at, pick(locale, COPY.checking), locale);
    return pick(locale, fill(COPY.noteEffectRunning, { until }));
  }
  return null;
}

/** What one settled upkeep is reported as, from the figure that was charged. */
export function settlementMessage(receipt: SettlementReceipt): string {
  const amount = groupDigits(receipt.paid_amount);
  return receipt.replayed
    ? `이미 처리된 납부예요. 결제된 금액은 ${amount} WLD였어요.`
    : `밀린 관리비 ${amount} WLD를 냈어요. 이제 이 아이템을 다시 쓸 수 있어요.`;
}


/** Keep member stock filtering server-authoritative; unknown URL values are ignored by the UI. */
export function stockCatalogApiPath(stock?: string): string {
  return stock === 'available' ? '/api/v1/shop/catalog?stock=available' : '/api/v1/shop/catalog';
}
