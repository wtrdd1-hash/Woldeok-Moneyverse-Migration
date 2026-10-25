/** Security activity exports intentionally omit IP, device, session and token metadata. */
export interface SecurityEventExport {
  readonly type: string;
  readonly createdAt: string;
}

const EVENT_TYPE = /^[a-z][a-z0-9_]{0,63}$/;
const UTC_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

function validatedEvent(value: unknown): SecurityEventExport {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError('Invalid security event');
  }
  const record = value as Record<string, unknown>;
  const type = record.type;
  const createdAt = record.createdAt;
  if (typeof type !== 'string' || !EVENT_TYPE.test(type)) {
    throw new TypeError('Invalid security event type');
  }
  if (typeof createdAt !== 'string' || !UTC_TIMESTAMP.test(createdAt)) {
    throw new TypeError('Invalid security event timestamp');
  }
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== createdAt) {
    throw new TypeError('Invalid security event timestamp');
  }
  return { type, createdAt };
}

function cell(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

export function securityEventsCsv(events: unknown): string {
  if (!Array.isArray(events) || events.length > 50) {
    throw new TypeError('Invalid bounded security event list');
  }
  const rows = events.map((raw: unknown) => {
    const event = validatedEvent(raw);
    return [cell(event.type), cell(event.createdAt)].join(',');
  });
  return '\uFEFF' + [['Event type', 'UTC timestamp'].map(cell).join(','), ...rows].join('\r\n') + '\r\n';
}
