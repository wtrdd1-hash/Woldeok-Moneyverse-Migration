import type { OutboxEvent } from '../../types';

export type DeliveryStatusFilter = 'all' | 'outstanding' | 'delivered' | 'terminal' | 'retried';

export interface DeliveryFilter {
  readonly status: DeliveryStatusFilter;
  readonly event: string;
}

const VALID_STATUSES = new Set<DeliveryStatusFilter>(['all', 'outstanding', 'delivered', 'terminal', 'retried']);
const EVENT_QUERY = /^[A-Za-z0-9._/:-]{1,64}$/;
const OUTSTANDING = new Set(['pending', 'delivering', 'retry_pending']);
const TERMINAL = new Set(['suppressed', 'dead_letter']);

/** Reject ambiguous URL arrays and invalid values rather than silently broadening an admin audit query. */
export function parseDeliveryFilter(query: { readonly status?: unknown; readonly event?: unknown }): DeliveryFilter | null {
  const status = query.status === undefined ? 'all' : query.status;
  if (typeof status !== 'string' || !VALID_STATUSES.has(status as DeliveryStatusFilter)) return null;
  const event = query.event === undefined ? '' : query.event;
  if (typeof event !== 'string') return null;
  const normalized = event.trim();
  if (normalized && !EVENT_QUERY.test(normalized)) return null;
  return { status: status as DeliveryStatusFilter, event: normalized };
}

/** Only filter the authenticated, already validated recent PostgreSQL sample. Never imply whole-history coverage. */
export function filterDeliveryEvents(events: readonly OutboxEvent[], filter: DeliveryFilter): readonly OutboxEvent[] {
  const term = filter.event.toLowerCase();
  return events.filter((row) => {
    if (term && !row.event_type.toLowerCase().includes(term)) return false;
    if (filter.status === 'outstanding') return OUTSTANDING.has(row.delivery_status);
    if (filter.status === 'terminal') return TERMINAL.has(row.delivery_status);
    if (filter.status === 'delivered') return row.delivery_status === 'delivered';
    if (filter.status === 'retried') return row.delivery_attempts > 1;
    return true;
  });
}
