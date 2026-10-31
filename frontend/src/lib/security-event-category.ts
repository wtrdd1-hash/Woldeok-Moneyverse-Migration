import type { VerifiedSecurityEvent } from '@/app/account/security/account-security-evidence';

export type SecurityEventCategory = 'all' | 'login' | 'settings';

const SETTINGS_TYPES = new Set([
  'local_password_reset_requested',
  'local_password_reset_completed',
  'local_password_changed',
  'local_email_change_requested',
  'local_email_changed',
]);

export function parseSecurityEventCategory(value: unknown): SecurityEventCategory | null {
  if (value === undefined || value === 'all') return 'all';
  if (value === 'login' || value === 'settings') return value;
  return null;
}

export function securityEventsMatchCategory(
  events: readonly VerifiedSecurityEvent[],
  category: SecurityEventCategory,
): boolean {
  if (category === 'all') return true;
  return events.every((event) =>
    category === 'login' ? event.type === 'local_login_succeeded' : SETTINGS_TYPES.has(event.type),
  );
}

export type SecurityEventOrder = 'recent' | 'oldest';

export function parseSecurityEventOrder(value: unknown): SecurityEventOrder | null {
  if (value === undefined || value === 'recent') return 'recent';
  if (value === 'oldest') return 'oldest';
  return null;
}

/** A success-shaped response that ignores sort must not be shown as verified history. */
export function securityEventsMatchOrder(
  events: readonly VerifiedSecurityEvent[],
  order: SecurityEventOrder,
): boolean {
  for (let i = 1; i < events.length; i += 1) {
    const previous = Date.parse(events[i - 1]!.createdAt);
    const current = Date.parse(events[i]!.createdAt);
    if (!Number.isFinite(previous) || !Number.isFinite(current)) return false;
    if (order === 'recent' ? current > previous : current < previous) return false;
  }
  return true;
}
