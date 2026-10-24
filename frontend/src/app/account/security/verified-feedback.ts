/** Security feedback must be derived from authenticated server state, never URL parameters. */
export function hasRecentServerReauthentication(
  sessions: readonly { readonly current: boolean; readonly reauthenticatedAt: string | null }[] | null,
  now: number,
): boolean {
  if (!sessions || !Number.isFinite(now)) return false;
  const current = sessions.find((session) => session.current);
  if (!current?.reauthenticatedAt) return false;
  const time = Date.parse(current.reauthenticatedAt);
  return Number.isFinite(time) && time <= now && now - time < 10 * 60 * 1000;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isConfirmedPasswordChange(value: unknown): boolean {
  return isObject(value) && value.outcome === 'password-changed';
}

export function isConfirmedReauthentication(value: unknown): boolean {
  return isObject(value) && value.outcome === 'reauthenticated';
}

export function isConfirmedEmailRequest(value: unknown): boolean {
  return isObject(value) && value.accepted === true && value.verificationRequired === true;
}

export function isConfirmedRevocationCount(value: unknown): value is { revokedSessions: number } {
  return isObject(value) && typeof value.revokedSessions === 'number' && Number.isSafeInteger(value.revokedSessions) && value.revokedSessions >= 0;
}
