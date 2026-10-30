/** Fail-closed proof for a bounded, owner-scoped stock-alert trigger window. */
export type StockAlertEventKind = 'all' | 'price' | 'change';
export interface VerifiedStockAlertEvent {
  readonly event_id: string;
  readonly symbol: string;
  readonly name: string;
  readonly condition_kind: string;
  readonly threshold_amount: string | null;
  readonly threshold_bps: number | null;
  readonly trigger_price: string;
  readonly trigger_day_change_bps: number;
  readonly triggered_at: string;
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const WLD = /^(?:0|[1-9][0-9]{0,29})$/;
const BIGINT_MAX = 9_223_372_036_854_775_807n;
function validWld(value: unknown): value is string {
  return typeof value === 'string' && WLD.test(value) && BigInt(value) <= BIGINT_MAX;
}
const PRICE = new Set(['price_at_or_above', 'price_at_or_below']);
const CHANGE = new Set(['day_change_at_or_above', 'day_change_at_or_below']);

export function parseStockAlertEvents(
  payload: unknown,
  kind: StockAlertEventKind,
  limit: number,
): { readonly events: readonly VerifiedStockAlertEvent[] } | null {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 ||
      !payload || typeof payload !== 'object' || Array.isArray(payload) ||
      !('events' in payload) || !Array.isArray(payload.events) || payload.events.length > limit) return null;
  const ids = new Set<string>();
  const events: VerifiedStockAlertEvent[] = [];
  for (const raw of payload.events) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const row = raw as Record<string, unknown>;
    const isPrice = PRICE.has(String(row.condition_kind));
    const isChange = CHANGE.has(String(row.condition_kind));
    if ((!isPrice && !isChange) || (kind === 'price' && !isPrice) || (kind === 'change' && !isChange) ||
        typeof row.event_id !== 'string' || !UUID.test(row.event_id) || ids.has(row.event_id) ||
        typeof row.symbol !== 'string' || row.symbol.length < 1 || row.symbol.length > 32 ||
        typeof row.name !== 'string' || row.name.length < 1 || row.name.length > 160 ||
        !validWld(row.trigger_price) ||
        typeof row.trigger_day_change_bps !== 'number' || !Number.isSafeInteger(row.trigger_day_change_bps) ||
        typeof row.triggered_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.triggered_at) ||
        !Number.isFinite(Date.parse(row.triggered_at)) ||
        (isPrice && (!validWld(row.threshold_amount) || row.threshold_bps !== null)) ||
        (isChange && (row.threshold_amount !== null || typeof row.threshold_bps !== 'number' || !Number.isSafeInteger(row.threshold_bps)))) return null;
    ids.add(row.event_id);
    events.push(row as unknown as VerifiedStockAlertEvent);
  }
  return { events };
}
