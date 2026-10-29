import type { VerifiedSecurityEvent } from '../account-security-evidence';

const EVENT_TYPE = /^[a-z][a-z0-9_.-]{0,79}$/;

/** Only export owner-scoped event type and UTC timestamp, never audit metadata. */
export function securityEventsCsv(events: readonly VerifiedSecurityEvent[]): string {
  if (events.length > 20) throw new Error('security event count exceeds the verified limit');
  const rows = events.map((event) => {
    if (!EVENT_TYPE.test(event.type) ||
        !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(event.createdAt) ||
        !Number.isFinite(Date.parse(event.createdAt)) ||
        new Date(event.createdAt).toISOString() !== event.createdAt) {
      throw new Error('invalid security event evidence');
    }
    return `${event.type},${event.createdAt}`;
  });
  return `\uFEFF${['event_type,occurred_at_utc', ...rows].join('\r\n')}\r\n`;
}
