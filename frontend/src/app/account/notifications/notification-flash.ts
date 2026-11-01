/** A query parameter is never evidence that a member preference was persisted. */
export function isNotificationSaveConfirmed(
  saved: unknown,
  cookieValue: unknown,
  verifiedEnabled: boolean | null,
): boolean {
  return typeof saved === 'string'
    && /^[a-f0-9]{32}$/.test(saved)
    && typeof verifiedEnabled === 'boolean'
    && cookieValue === `${saved}:${verifiedEnabled ? '1' : '0'}`;
}
