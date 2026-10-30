import type { VerifiedSecurityEvent } from '@/app/account/security/account-security-evidence';

export interface SecurityEventDateRange {
  readonly from: string;
  readonly to: string;
  readonly startMs: number;
  readonly endMs: number;
}

const DAY_MS = 86_400_000;
const KST_MS = 9 * 60 * 60 * 1000;

function utcDay(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const day = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== value) return null;
  return day;
}

export function parseSecurityEventDateRange(
  from: unknown,
  to: unknown,
): SecurityEventDateRange | null | undefined {
  if (from === undefined && to === undefined) return undefined;
  const startDay = utcDay(from);
  const endDay = utcDay(to);
  if (
    startDay === null ||
    endDay === null ||
    endDay < startDay ||
    endDay - startDay >= 366 * DAY_MS
  )
    return null;
  return {
    from: from as string,
    to: to as string,
    startMs: startDay - KST_MS,
    endMs: endDay + DAY_MS - KST_MS,
  };
}

export function securityEventsMatchDateRange(
  events: readonly VerifiedSecurityEvent[],
  range?: SecurityEventDateRange,
): boolean {
  return (
    !range ||
    events.every((event) => {
      const at = Date.parse(event.createdAt);
      return Number.isFinite(at) && at >= range.startMs && at < range.endMs;
    })
  );
}
