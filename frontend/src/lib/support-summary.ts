export interface SupportSummary {
  readonly open: number;
  readonly waitingUser: number;
  readonly resolved: number;
  readonly scanned: number;
  readonly mayBeIncomplete: boolean;
}

/** Rejects malformed or stale upstream summary contracts rather than inventing counts. */
export function parseSupportSummary(value: unknown): SupportSummary | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const { open, waitingUser, resolved, scanned, mayBeIncomplete } = row;
  if (![open, waitingUser, resolved, scanned].every((n) =>
    typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 && n <= 100
  )) return null;
  if (typeof mayBeIncomplete !== 'boolean' || mayBeIncomplete !== (scanned === 100)) return null;
  if ((open as number) + (waitingUser as number) + (resolved as number) !== scanned) return null;
  return { open: open as number, waitingUser: waitingUser as number,
    resolved: resolved as number, scanned: scanned as number, mayBeIncomplete };
}
