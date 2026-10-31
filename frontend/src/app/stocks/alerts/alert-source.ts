import type { AlertEvent, AlertRule, AlertStock } from './alert-manager';

export interface VerifiedStockAlertPage {
  readonly stocks: readonly AlertStock[];
  readonly alerts: readonly AlertRule[];
  readonly events: readonly AlertEvent[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_WLD = 9_223_372_036_854_775_807n;
const PRICE = new Set(['price_at_or_above', 'price_at_or_below']);
const CHANGE = new Set(['day_change_at_or_above', 'day_change_at_or_below']);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function uuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

function display(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= maxLength &&
    value.trim().length > 0 && !/[\u0000-\u001f\u007f]/.test(value);
}

function integer(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value);
}

function wld(value: unknown, positive = false): value is string {
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,18})$/.test(value)) return false;
  const amount = BigInt(value);
  return amount <= MAX_WLD && (!positive || amount > 0n);
}

function timestamp(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return false;
  const time = new Date(value);
  return !Number.isNaN(time.valueOf()) && time.toISOString().slice(0, 10) === value.slice(0, 10);
}

function threshold(row: Record<string, unknown>): boolean {
  if (PRICE.has(row.condition_kind as string)) {
    return wld(row.threshold_amount, true) && row.threshold_bps === null;
  }
  if (CHANGE.has(row.condition_kind as string)) {
    return row.threshold_amount === null && integer(row.threshold_bps) &&
      row.threshold_bps >= -100_000 && row.threshold_bps <= 100_000;
  }
  return false;
}

function stock(value: unknown): value is AlertStock {
  return record(value) && uuid(value.id) && display(value.symbol, 32) && display(value.name, 160);
}

function rule(value: unknown): value is AlertRule {
  return record(value) && uuid(value.alert_id) && uuid(value.stock_id) &&
    display(value.symbol, 32) && display(value.name, 160) && threshold(value) &&
    integer(value.cooldown_seconds) && value.cooldown_seconds >= 300 && value.cooldown_seconds <= 604_800 &&
    wld(value.current_price) && integer(value.current_day_change_bps) &&
    typeof value.condition_met === 'boolean' &&
    (value.last_triggered_at === null || timestamp(value.last_triggered_at));
}

function event(value: unknown): value is AlertEvent {
  return record(value) && uuid(value.event_id) &&
    display(value.symbol, 32) && display(value.name, 160) && threshold(value) &&
    wld(value.trigger_price) && integer(value.trigger_day_change_bps) &&
    timestamp(value.triggered_at);
}

function unique<T>(items: readonly T[], key: (item: T) => string): boolean {
  return new Set(items.map((item) => key(item).toLowerCase())).size === items.length;
}

/**
 * A 200 response is not proof of a valid owner read. Reject the entire
 * snapshot rather than silently discard invalid rules or invent empty lists.
 */
export function parseStockAlertPage(
  market: unknown,
  rules: unknown,
  history: unknown,
): VerifiedStockAlertPage | null {
  if (!record(market) || !Array.isArray(market.stocks) || !market.stocks.every(stock) ||
      !record(rules) || !Array.isArray(rules.alerts) || !rules.alerts.every(rule) ||
      !record(history) || !Array.isArray(history.events) || !history.events.every(event)) {
    return null;
  }

  const stocks: AlertStock[] = market.stocks;
  const alerts: AlertRule[] = rules.alerts;
  const events: AlertEvent[] = history.events;
  if (!unique(stocks, (row) => row.id) || !unique(stocks, (row) => row.symbol) ||
      !unique(alerts, (row) => row.alert_id) || !unique(events, (row) => row.event_id)) {
    return null;
  }
  return { stocks, alerts, events };
}
