import type { AuditSearchRow } from '../types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HASH = /^[0-9a-f]{64}$/i;
const SEQUENCE = /^[1-9][0-9]{0,18}$/;
const MAX_SEQUENCE = 9223372036854775807n;

export type AuditIdentity =
  | { readonly status: 'all' | 'unavailable' | 'not_found' | 'ambiguous' | 'invalid' }
  | { readonly status: 'resolved'; readonly userId: string };

export interface VerifiedAuditSearch {
  readonly events: readonly AuditSearchRow[];
  readonly nextCursor: string | null;
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function sequence(value: unknown): value is string {
  return typeof value === 'string' && SEQUENCE.test(value) && BigInt(value) <= MAX_SEQUENCE;
}

/** A wealth-ordered snapshot is not an identity directory if another page exists. */
export function resolveAuditIdentity(raw: string, response: unknown): AuditIdentity {
  const input = raw.trim();
  if (input === '') return { status: 'all' };
  if (UUID.test(input)) return { status: 'resolved', userId: input.toLowerCase() };
  if (input.length > 80 || /[\u0000-\u001f\u007f]/.test(input)) return { status: 'invalid' };
  if (!object(response) || !object(response.scope) || !Array.isArray(response.users) ||
      response.scope.kind !== 'WEALTH_ORDERED_SNAPSHOT' || response.scope.limit !== 50 ||
      typeof response.scope.hasMore !== 'boolean' || response.users.length > 50) {
    return { status: 'unavailable' };
  }
  const seen = new Set<string>();
  for (const member of response.users) {
    if (!object(member) || typeof member.user_id !== 'string' || !UUID.test(member.user_id) ||
        typeof member.display_name !== 'string' || member.display_name.length > 80 ||
        seen.has(member.user_id.toLowerCase())) return { status: 'unavailable' };
    seen.add(member.user_id.toLowerCase());
  }
  if (response.scope.hasMore) return { status: 'unavailable' };
  const matched = response.users.filter((member: { display_name: string }) =>
    member.display_name.toLowerCase() === input.toLowerCase());
  if (matched.length === 0) return { status: 'not_found' };
  if (matched.length > 1) return { status: 'ambiguous' };
  return { status: 'resolved', userId: matched[0].user_id.toLowerCase() };
}

const optionalUuid = (value: unknown) => value === null || (typeof value === 'string' && UUID.test(value));
const optionalText = (value: unknown) => value === null || typeof value === 'string';

function validRow(value: unknown): value is AuditSearchRow {
  if (!object(value) || !sequence(value.sequence) || typeof value.audit_id !== 'string' || !UUID.test(value.audit_id) ||
      typeof value.created_at !== 'string' || !Number.isFinite(Date.parse(value.created_at)) ||
      !Number.isInteger(value.hash_version) || (value.hash_version as number) < 1 ||
      typeof value.action !== 'string' || value.action.length === 0 || value.action.length > 120 ||
      !optionalUuid(value.actor_user_id) || !optionalUuid(value.subject_user_id) ||
      !optionalUuid(value.target_id) || !optionalUuid(value.transaction_id) ||
      !optionalUuid(value.request_id) || !optionalUuid(value.trace_id) ||
      !optionalText(value.feature) || !optionalText(value.target_kind) ||
      !optionalText(value.session_hash) || !optionalText(value.client_ip) ||
      (value.outcome !== null && !['success', 'failure', 'partial'].includes(String(value.outcome))) ||
      (value.response_status !== null && (!Number.isInteger(value.response_status) ||
        (value.response_status as number) < 100 || (value.response_status as number) > 599)) ||
      !object(value.metadata) || !object(value.context) ||
      typeof value.integrity_hash !== 'string' || !HASH.test(value.integrity_hash) ||
      (value.previous_integrity_hash !== null &&
        (typeof value.previous_integrity_hash !== 'string' || !HASH.test(value.previous_integrity_hash)))) return false;
  return true;
}

/** The cursor is a PostgreSQL bigint, never a JavaScript number or inferred offset. */
export function parseAuditSearchResponse(
  response: unknown,
  limit: number,
  beforeCursor?: string,
): VerifiedAuditSearch | null {
  if (!object(response) || !Array.isArray(response.events) ||
      !Number.isInteger(limit) || limit < 1 || limit > 100 || response.events.length > limit ||
      (beforeCursor !== undefined && !sequence(beforeCursor))) return null;
  if (response.events.length === 0) {
    return response.nextCursor === null ? { events: [], nextCursor: null } : null;
  }
  if (!response.events.every(validRow)) return null;
  const events = response.events as AuditSearchRow[];
  const seen = new Set<string>();
  let previous = beforeCursor === undefined ? MAX_SEQUENCE + 1n : BigInt(beforeCursor);
  for (const event of events) {
    const current = BigInt(event.sequence);
    if (current >= previous || seen.has(event.audit_id.toLowerCase())) return null;
    previous = current;
    seen.add(event.audit_id.toLowerCase());
  }
  if (!sequence(response.nextCursor) || response.nextCursor !== events[events.length - 1]?.sequence) return null;
  return { events, nextCursor: response.nextCursor };
}
