/** Untrusted callback hints never establish a successful security outcome. */
import { parseLinkedIdentities, parseSecuritySessions } from './security/account-security-evidence';

export type AccountNotice = 'confirmed' | 'unverified' | null;
const CALLBACK_PROVIDERS = new Set(['discord', 'google']);
const REAUTH_WINDOW_MS = 15 * 60 * 1000;

/** A callback can only confirm a provider currently present in the owner's read model. */
export function accountLinkedNotice(linked: unknown, readback: unknown): AccountNotice {
  if (typeof linked !== 'string' || !CALLBACK_PROVIDERS.has(linked)) return null;
  const identities = parseLinkedIdentities(readback);
  return identities?.some((identity) => identity.provider === linked) ? 'confirmed' : 'unverified';
}

/** Match the backend's 15-minute step-up window against the current owner session. */
export function accountReauthNotice(reauth: unknown, readback: unknown, nowMs: number): AccountNotice {
  if (reauth !== 'done') return null;
  if (!Number.isFinite(nowMs)) return 'unverified';
  const sessions = parseSecuritySessions(readback);
  const current = sessions?.find((session) => session.current);
  if (!current?.reauthenticatedAt || Date.parse(current.expiresAt) <= nowMs) return 'unverified';
  const reauthenticatedAt = Date.parse(current.reauthenticatedAt);
  return reauthenticatedAt <= nowMs && nowMs - reauthenticatedAt < REAUTH_WINDOW_MS
    ? 'confirmed'
    : 'unverified';
}
