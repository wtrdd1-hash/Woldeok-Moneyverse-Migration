import type { OutboxEvent } from '../../types';

/** The authenticated SQL read model returns at most 30 recent rows by default. */
const MAX_RECENT_ROWS = 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_TYPE = /^[\w./:-]{1,128}$/;
const STATUS = /^[a-z][a-z0-9_:-]{0,79}$/;

function timestamp(value: unknown): value is string {
  return typeof value === 'string' &&
    /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(value) &&
    Number.isFinite(Date.parse(value));
}

/** Reject the entire response when any row is malformed: partial counts are misleading. */
export function parseDeliveryEvidence(input: unknown): { readonly events: readonly OutboxEvent[] } | null {
  if (input === null || typeof input !== 'object' || !('events' in input)) return null;
  const raw = input.events;
  if (!Array.isArray(raw) || raw.length > MAX_RECENT_ROWS) return null;

  const seen = new Set<string>();
  const events: OutboxEvent[] = [];
  for (const value of raw) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
    const row = value as Record<string, unknown>;
    if (typeof row.event_id !== 'string' || !UUID.test(row.event_id) ||
        seen.has(row.event_id.toLowerCase()) ||
        typeof row.event_type !== 'string' || !EVENT_TYPE.test(row.event_type) ||
        !timestamp(row.created_at) ||
        (row.delivered_at !== null && !timestamp(row.delivered_at)) ||
        !Number.isSafeInteger(row.delivery_attempts) || (row.delivery_attempts as number) < 0 ||
        typeof row.delivery_status !== 'string' || !STATUS.test(row.delivery_status) ||
        (row.delivery_status === 'delivered') !== (row.delivered_at !== null)) return null;
    seen.add(row.event_id.toLowerCase());
    events.push({
      event_id: row.event_id,
      event_type: row.event_type,
      created_at: row.created_at,
      delivered_at: row.delivered_at,
      delivery_attempts: row.delivery_attempts as number,
      delivery_status: row.delivery_status,
    });
  }
  return { events };
}
