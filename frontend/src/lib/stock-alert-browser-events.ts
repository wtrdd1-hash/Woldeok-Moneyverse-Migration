export interface VerifiedStockAlertEvent {
  readonly eventId: string;
  readonly symbol: string;
  readonly name: string;
  readonly conditionKind: string;
  readonly triggerPrice: string;
  readonly triggeredAt: string;
}

export interface VerifiedStockAlertSnapshot {
  readonly activeAlertCount: number;
  readonly events: readonly VerifiedStockAlertEvent[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SYMBOL = /^[A-Za-z0-9._-]{1,16}$/;
const PRICE = /^(0|[1-9][0-9]{0,18})$/;
const CONDITIONS = new Set([
  'price_at_or_above', 'price_at_or_below',
  'day_change_at_or_above', 'day_change_at_or_below',
]);

/** Accept only authoritative server receipts; never derive alerts from calculator storage. */
export function parseVerifiedStockAlertSnapshot(input: unknown): VerifiedStockAlertSnapshot | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.alerts) || value.alerts.length > 1000 ||
      !Array.isArray(value.events) || value.events.length > 10) return null;

  const events: VerifiedStockAlertEvent[] = [];
  const seen = new Set<string>();
  for (const item of value.events) {
    if (!item || typeof item !== 'object') return null;
    const row = item as Record<string, unknown>;
    if (typeof row.event_id !== 'string' || !UUID.test(row.event_id) || seen.has(row.event_id) ||
        typeof row.symbol !== 'string' || !SYMBOL.test(row.symbol) ||
        typeof row.name !== 'string' || row.name.length < 1 || row.name.length > 100 ||
        typeof row.condition_kind !== 'string' || !CONDITIONS.has(row.condition_kind) ||
        typeof row.trigger_price !== 'string' || !PRICE.test(row.trigger_price) ||
        typeof row.triggered_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.triggered_at) ||
        !Number.isFinite(Date.parse(row.triggered_at))) return null;
    seen.add(row.event_id);
    events.push({
      eventId: row.event_id, symbol: row.symbol, name: row.name,
      conditionKind: row.condition_kind, triggerPrice: row.trigger_price,
      triggeredAt: row.triggered_at,
    });
  }
  return { activeAlertCount: value.alerts.length, events };
}

/** Revalidate the minimized Next response before any browser notification is created. */
export function parseVerifiedBrowserStockAlertSnapshot(input: unknown): VerifiedStockAlertSnapshot | null {
  if (!input || typeof input !== 'object') return null;
  const row = input as Record<string, unknown>;
  if (!Number.isSafeInteger(row.activeAlertCount) || (row.activeAlertCount as number) < 0 ||
      (row.activeAlertCount as number) > 1000 || !Array.isArray(row.events) || row.events.length > 10) return null;
  const rawEvents = row.events.map((event: unknown) => {
    if (!event || typeof event !== 'object') return null;
    const value = event as Record<string, unknown>;
    return {
      event_id: value.eventId, symbol: value.symbol, name: value.name,
      condition_kind: value.conditionKind, trigger_price: value.triggerPrice,
      triggered_at: value.triggeredAt,
    };
  });
  return parseVerifiedStockAlertSnapshot({
    alerts: Array(row.activeAlertCount as number).fill(null), events: rawEvents,
  });
}

/** The first read establishes a baseline; old or future events are never broadcast. */
export function selectNewVerifiedStockAlertEvents(
  events: readonly VerifiedStockAlertEvent[], previousPollAt: number | null, now: number,
): readonly VerifiedStockAlertEvent[] {
  if (previousPollAt === null || !Number.isFinite(previousPollAt) || !Number.isFinite(now)) return [];
  return events.filter((event) => {
    const time = Date.parse(event.triggeredAt);
    return Number.isFinite(time) && time > previousPollAt && time <= now;
  }).slice(0, 3);
}
