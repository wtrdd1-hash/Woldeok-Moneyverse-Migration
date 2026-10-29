import type { OutboxEvent } from '../../types';

/** The authenticated PostgreSQL read model returns at most 30 recent rows by default. */
const MAX_RECENT_ROWS = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_TYPE = /^[\w./:-]{1,128}$/;
const STATUSES = new Set(['pending', 'delivering', 'retry_pending', 'delivered', 'suppressed', 'dead_letter']);
const ACTIVE_STATUSES = new Set(['pending', 'delivering', 'retry_pending']);
const TERMINAL_STATUSES = new Set(['suppressed', 'dead_letter']);
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

function timestamp(value: unknown): value is string {
  return typeof value === 'string' &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    Date.parse(value) <= Date.now() + MAX_CLOCK_SKEW_MS;
}

export interface DeliveryEvidence {
  readonly events: readonly OutboxEvent[];
  readonly delivered: number;
  readonly outstanding: number;
  readonly terminal: number;
  /** Number of rows with more than one delivery attempt, regardless of final outcome. */
  readonly retried: number;
}

/** Fail closed on invalid evidence: partial success/failure counts are misleading. */
export function parseDeliveryEvidence(input: unknown): DeliveryEvidence | null {
  if (input === null || typeof input !== 'object' || !('events' in input)) return null;
  const raw = input.events;
  if (!Array.isArray(raw) || raw.length > MAX_RECENT_ROWS) return null;

  const seen = new Set<string>();
  const events: OutboxEvent[] = [];
  let delivered = 0;
  let outstanding = 0;
  let terminal = 0;
  let retried = 0;

  for (const value of raw) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
    const row = value as Record<string, unknown>;
    if (typeof row.event_id !== 'string' || !UUID.test(row.event_id) ||
        seen.has(row.event_id.toLowerCase()) ||
        typeof row.event_type !== 'string' || !EVENT_TYPE.test(row.event_type) ||
        !timestamp(row.created_at) ||
        (row.delivered_at !== null && !timestamp(row.delivered_at)) ||
        !Number.isSafeInteger(row.delivery_attempts) || (row.delivery_attempts as number) < 0 ||
        typeof row.delivery_status !== 'string' || !STATUSES.has(row.delivery_status) ||
        (row.delivery_status === 'delivered') !== (row.delivered_at !== null) ||
        (row.delivered_at !== null && Date.parse(row.delivered_at as string) < Date.parse(row.created_at))) return null;

    seen.add(row.event_id.toLowerCase());
    if (row.delivery_status === 'delivered') delivered++;
    else if (ACTIVE_STATUSES.has(row.delivery_status)) outstanding++;
    else if (TERMINAL_STATUSES.has(row.delivery_status)) terminal++;
    if ((row.delivery_attempts as number) > 1) retried++;
    events.push({
      event_id: row.event_id,
      event_type: row.event_type,
      created_at: row.created_at,
      delivered_at: row.delivered_at,
      delivery_attempts: row.delivery_attempts as number,
      delivery_status: row.delivery_status,
    });
  }
  return { events, delivered, outstanding, terminal, retried };
}
