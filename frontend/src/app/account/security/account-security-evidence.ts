/** Minimal, owner-scoped account-security read models. Unverified data is never actionable. */
export interface VerifiedSecuritySession {
  readonly sessionId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly reauthenticatedAt: string | null;
  readonly current: boolean;
  readonly administratorSession: boolean;
  readonly lastSeenAt: string;
  readonly deviceLabel: string;
}

export interface VerifiedLinkedIdentity {
  readonly identityId: string;
  readonly provider: 'local_email' | 'discord' | 'google';
  readonly displayName: string;
  readonly linkedAt: string;
}

export interface VerifiedSecurityEvent {
  readonly type: string;
  readonly createdAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENT_TYPE = /^[a-z][a-z0-9_.-]{0,79}$/;
const PROVIDERS = new Set(['local_email', 'discord', 'google']);

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.valueOf()) && parsed.toISOString() === value;
}

function uuid(value: unknown): value is string {
  return typeof value === 'string' && UUID.test(value);
}

export function parseSecuritySessions(value: unknown, scope: 'all' | 'other' = 'all'): readonly VerifiedSecuritySession[] | null {
  if (!record(value) || !Array.isArray(value.sessions) || value.sessions.length > 100) return null;
  const ids = new Set<string>();
  const sessions: VerifiedSecuritySession[] = [];
  let currentCount = 0;
  for (const candidate of value.sessions) {
    if (!record(candidate) || !uuid(candidate.sessionId) ||
      !isoDate(candidate.createdAt) || !isoDate(candidate.expiresAt) ||
      !isoDate(candidate.lastSeenAt) ||
      (candidate.reauthenticatedAt !== null && !isoDate(candidate.reauthenticatedAt)) ||
      typeof candidate.current !== 'boolean' ||
      typeof candidate.administratorSession !== 'boolean' ||
      typeof candidate.deviceLabel !== 'string' || candidate.deviceLabel.trim().length === 0 ||
      candidate.deviceLabel.length > 160 || /[\x00-\x1f\x7f]/.test(candidate.deviceLabel) ||
      Date.parse(candidate.expiresAt) <= Date.parse(candidate.createdAt) ||
      Date.parse(candidate.lastSeenAt) < Date.parse(candidate.createdAt) ||
      (candidate.reauthenticatedAt !== null && Date.parse(candidate.reauthenticatedAt) < Date.parse(candidate.createdAt))
    ) return null;
    const key = candidate.sessionId.toLowerCase();
    if (ids.has(key)) return null;
    ids.add(key);
    if (candidate.current) currentCount += 1;
    sessions.push({
      sessionId: candidate.sessionId, createdAt: candidate.createdAt, expiresAt: candidate.expiresAt,
      reauthenticatedAt: candidate.reauthenticatedAt, current: candidate.current,
      administratorSession: candidate.administratorSession, lastSeenAt: candidate.lastSeenAt,
      deviceLabel: candidate.deviceLabel,
    });
  }
  // The authenticated caller must not see two current sessions or an ambiguous all-other list.
  if (sessions.length > 0 && currentCount !== (scope === 'other' ? 0 : 1)) return null;
  return sessions;
}

export function parseLinkedIdentities(value: unknown): readonly VerifiedLinkedIdentity[] | null {
  if (!record(value) || !Array.isArray(value.identities) || value.identities.length > 10) return null;
  const ids = new Set<string>();
  const providers = new Set<string>();
  const identities: VerifiedLinkedIdentity[] = [];
  for (const candidate of value.identities) {
    if (!record(candidate) || !uuid(candidate.identityId) ||
      typeof candidate.provider !== 'string' || !PROVIDERS.has(candidate.provider) ||
      typeof candidate.displayName !== 'string' || candidate.displayName.length > 160 ||
      !isoDate(candidate.linkedAt)) return null;
    const key = candidate.identityId.toLowerCase();
    if (ids.has(key) || providers.has(candidate.provider)) return null;
    ids.add(key);
    providers.add(candidate.provider);
    identities.push({ identityId: candidate.identityId,
      provider: candidate.provider as VerifiedLinkedIdentity['provider'],
      displayName: candidate.displayName, linkedAt: candidate.linkedAt });
  }
  return identities;
}

export function parseSecurityEvents(value: unknown): readonly VerifiedSecurityEvent[] | null {
  if (!record(value) || !Array.isArray(value.events) || value.events.length > 20) return null;
  const events: VerifiedSecurityEvent[] = [];
  for (const candidate of value.events) {
    if (!record(candidate) || typeof candidate.type !== 'string' ||
      !EVENT_TYPE.test(candidate.type) || !isoDate(candidate.createdAt)) return null;
    events.push({ type: candidate.type, createdAt: candidate.createdAt });
  }
  return events;
}
