/** Owner session read scope; unknown or duplicate query values never downgrade to all. */
export type SecuritySessionScope = 'all' | 'other';

export function parseSecuritySessionScope(value: unknown): SecuritySessionScope | null {
  if (value === undefined || value === 'all') return 'all';
  if (value === 'other') return 'other';
  return null;
}
