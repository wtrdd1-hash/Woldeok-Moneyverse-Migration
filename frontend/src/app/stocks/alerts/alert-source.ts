import type { AlertEvent, AlertRule, AlertStock } from './alert-manager';

/** Unknown, malformed, duplicate or incomplete owner data is never a verified empty list. */
export interface VerifiedAlertPageSource {
  readonly stocks: AlertStock[];
  readonly alerts: AlertRule[];
  readonly events: AlertEvent[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONDITIONS = new Set(['price_at_or_above', 'price_at_or_below', 'day_change_at_or_above', 'day_change_at_or_below']);
const MAX_WLD = 9223372036854775807n;
const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const uuid = (value: unknown): value is string => typeof value === 'string' && UUID.test(value);
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 160;
const symbol = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Z0-9._-]{1,24}$/.test(value);
const int = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value);
const price = (value: unknown): value is string =>
  typeof value === 'string' && /^(?:0|[1-9][0-9]{0,18})$/.test(value) && BigInt(value) <= MAX_WLD;
const instant = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?(?:Z|[+-]\d\d:\d\d)$/.test(value) && Number.isFinite(Date.parse(value));

function condition(value: Record<string, unknown>): boolean {
  if (!CONDITIONS.has(String(value.condition_kind))) return false;
  if (String(value.condition_kind).startsWith('price_')) {
    return price(value.threshold_amount) && value.threshold_amount !== '0' && value.threshold_bps === null;
  }
  return value.threshold_amount === null && int(value.threshold_bps) &&
    (value.threshold_bps as number) >= -100_000 && (value.threshold_bps as number) <= 100_000;
}
function validStock(value: unknown): value is AlertStock {
  return record(value) && uuid(value.id) && symbol(value.symbol) && text(value.name);
}
function validRule(value: unknown): value is AlertRule {
  return record(value) && uuid(value.alert_id) && uuid(value.stock_id) && symbol(value.symbol) &&
    text(value.name) && condition(value) && int(value.cooldown_seconds) &&
    (value.cooldown_seconds as number) >= 300 && (value.cooldown_seconds as number) <= 604800 &&
    price(value.current_price) && int(value.current_day_change_bps) &&
    typeof value.condition_met === 'boolean' &&
    (value.last_triggered_at === null || instant(value.last_triggered_at));
}
function validEvent(value: unknown): value is AlertEvent {
  return record(value) && uuid(value.event_id) && symbol(value.symbol) && text(value.name) &&
    condition(value) && price(value.trigger_price) && int(value.trigger_day_change_bps) && instant(value.triggered_at);
}
function verifiedRows<T>(payload: unknown, key: string, max: number, validate: (row: unknown) => row is T, id: (row: T) => string): T[] | null {
  if (!record(payload) || !Array.isArray(payload[key]) || payload[key].length > max ||
      !payload[key].every(validate)) return null;
  const rows = payload[key] as T[];
  return new Set(rows.map((row) => id(row).toLowerCase())).size === rows.length ? rows : null;
}

/** Android may request up to 100 events; web requests 30. */
export function parseStockAlertRulesResponse(value: unknown): AlertRule[] | null {
  return verifiedRows(value, 'alerts', 500, validRule, (row) => row.alert_id);
}
export function parseStockAlertEventsResponse(value: unknown, limit = 100): AlertEvent[] | null {
  return verifiedRows(value, 'events', limit, validEvent, (row) => row.event_id);
}

export function parseStockAlertPageSource(market: unknown, rules: unknown, history: unknown): VerifiedAlertPageSource | null {
  const stocks = verifiedRows(market, 'stocks', 1000, validStock, (row) => row.id);
  const alerts = parseStockAlertRulesResponse(rules);
  const events = parseStockAlertEventsResponse(history, 30);
  if (stocks === null || alerts === null || events === null) return null;
  const symbols = new Set(stocks.map((row) => row.symbol.toUpperCase()));
  if (symbols.size !== stocks.length) return null;
  const symbolById = new Map(stocks.map((row) => [row.id.toLowerCase(), row.symbol]));
  if (alerts.some((row) => {
    const actual = symbolById.get(row.stock_id.toLowerCase());
    return actual !== undefined && actual !== row.symbol;
  })) return null;
  return { stocks, alerts, events };
}
