/**
 * Accept only the persisted boolean returned by the engagement API.
 * Neither an HTTP 2xx response nor a truthy string proves a saved preference.
 */
export function verifiedNotificationPreference(value: unknown): boolean | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const preference = (value as { notifications_enabled?: unknown }).notifications_enabled;
  return typeof preference === 'boolean' ? preference : null;
}
