/** Serializes a complete, bounded active-session snapshot, never a login history. */
export function activeSessionsCsv(payload: unknown): string {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Invalid session inventory');
  }
  const data = payload as Record<string, unknown>;
  if (data.limit !== 100 || data.complete !== true || !Array.isArray(data.sessions) || data.sessions.length > 100) {
    throw new Error('Incomplete session inventory');
  }

  const isoTime = (value: unknown): string => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
      throw new Error('Invalid session timestamp');
    }
    const date = new Date(value);
    if (Number.isNaN(date.valueOf()) || date.toISOString() !== value) throw new Error('Invalid session timestamp');
    return value;
  };

  const snapshot = isoTime(data.asOf);
  const cell = (value: string): string => {
    const normalized = value.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').trim();
    const safe = /^[=+\-@]/.test(normalized) ? "'" + normalized : normalized;
    return '"' + safe.replace(/"/g, '""') + '"';
  };

  const fields = ['administratorSession', 'createdAt', 'current', 'deviceLabel', 'expiresAt', 'lastSeenAt'];
  const rows = [
    ['Snapshot UTC', 'Current device', 'Administrator session', 'Device', 'Login UTC', 'Last activity UTC', 'Expires UTC'].map(cell).join(','),
  ];
  for (const raw of data.sessions) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid session row');
    const session = raw as Record<string, unknown>;
    if (Object.keys(session).sort().join(',') !== fields.join(',') ||
        typeof session.deviceLabel !== 'string' || session.deviceLabel.length > 100 ||
        typeof session.current !== 'boolean' || typeof session.administratorSession !== 'boolean') {
      throw new Error('Unexpected session fields');
    }
    rows.push([
      snapshot,
      session.current ? 'YES' : 'NO',
      session.administratorSession ? 'YES' : 'NO',
      session.deviceLabel,
      isoTime(session.createdAt),
      isoTime(session.lastSeenAt),
      isoTime(session.expiresAt),
    ].map(cell).join(','));
  }
  return '\uFEFF' + rows.join('\r\n') + '\r\n';
}
