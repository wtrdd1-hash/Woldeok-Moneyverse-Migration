/** A configured token and recipient do not prove that a Discord DM was delivered. */
export function getAdminDmReadiness(value: unknown): {
  readonly configured: boolean;
  readonly adminUserId: string | null;
} {
  if (typeof value !== 'object' || value === null) return { configured: false, adminUserId: null };
  const info = value as Record<string, unknown>;
  if (info.configured !== true || typeof info.adminUserId !== 'string' || !/^\d{17,20}$/.test(info.adminUserId)) {
    return { configured: false, adminUserId: null };
  }
  return { configured: true, adminUserId: info.adminUserId };
}
