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
