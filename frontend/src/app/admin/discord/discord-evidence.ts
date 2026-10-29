import type { AdminDiscordRoute, AdminOutboxHealth } from '../types';

export interface AdminDiscordEvidence {
  readonly outbox: AdminOutboxHealth;
  readonly routes: readonly AdminDiscordRoute[];
  readonly adminAlertInfo?: unknown;
}

const COUNT_FIELDS = [
  'pending_count', 'retry_pending_count', 'delivering_count', 'delivered_count',
  'dead_letter_count', 'suppressed_count', 'delivered_24h_count', 'stuck_count',
  'unrouted_type_count',
] as const;
const ROUTE_COUNTS = [
  'total_count', 'pending_count', 'dead_letter_count', 'suppressed_count',
  'delivered_24h_count',
] as const;
const MAX_BIGINT = 9223372036854775807n;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function count(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]{0,18})$/.test(value) && BigInt(value) <= MAX_BIGINT;
}

function timestamp(value: unknown, now: number): value is string | null {
  if (value === null) return true;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && parsed <= now + MAX_CLOCK_SKEW_MS;
}

function safeText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max &&
    value.trim() === value && !/[\u0000-\u001f\u007f]/.test(value);
}

/** Never let unverified delivery metrics or route metadata become an operational status. */
export function parseDiscordEvidence(value: unknown, now = Date.now()): AdminDiscordEvidence | null {
  if (!record(value) || !record(value.outbox) || !Array.isArray(value.routes) || value.routes.length > 1000) return null;
  const outbox = value.outbox;
  if (!COUNT_FIELDS.every((field) => count(outbox[field])) ||
      !timestamp(outbox.oldest_undelivered_at, now) ||
      !timestamp(outbox.last_delivered_at, now) ||
      !timestamp(outbox.last_failure_at, now)) return null;
  if (BigInt(outbox.delivered_24h_count as string) > BigInt(outbox.delivered_count as string)) return null;

  const seen = new Set<string>();
  for (const candidate of value.routes) {
    if (!record(candidate) || !safeText(candidate.event_type, 160) || seen.has(candidate.event_type)) return null;
    seen.add(candidate.event_type);
    if (typeof candidate.routed !== 'boolean' ||
        !ROUTE_COUNTS.every((field) => count(candidate[field])) ||
        !timestamp(candidate.last_delivered_at, now)) return null;
    const total = BigInt(candidate.total_count as string);
    if (ROUTE_COUNTS.slice(1).some((field) => BigInt(candidate[field] as string) > total)) return null;
    if (candidate.routed) {
      if (typeof candidate.channel_key !== 'string' || !/^[a-z][a-z0-9_-]{1,31}$/.test(candidate.channel_key) ||
          typeof candidate.enabled !== 'boolean' ||
          (candidate.note !== null && !safeText(candidate.note, 1000))) return null;
    } else if (candidate.channel_key !== null || candidate.enabled !== null || candidate.note !== null) {
      return null;
    }
  }
  return value as unknown as AdminDiscordEvidence;
}
