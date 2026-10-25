/** Serialize a bounded owner-only support conversation without executing CSV formulas. */
export function supportTranscriptCsv(payload: unknown): string {
  if (typeof payload !== 'object' || payload === null) throw new Error('Invalid transcript');
  const data = payload as Record<string, unknown>;
  if (data.limit !== 500 || typeof data.truncated !== 'boolean' || !Array.isArray(data.messages) || data.messages.length > 500) {
    throw new Error('Invalid transcript limit');
  }
  if (data.messages.length === 500 && data.truncated !== true) throw new Error('Unverified transcript completeness');
  const cell = (raw: string): string => {
    const normalized = raw.replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').trim();
    const safe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const rows: string[] = [
    ['Timestamp (UTC)', 'Sender', 'Message ID', 'Message', 'Export scope'].map(cell).join(','),
  ];
  for (const raw of data.messages) {
    if (typeof raw !== 'object' || raw === null) throw new Error('Invalid message');
    const item = raw as Record<string, unknown>;
    if (typeof item.message_id !== 'string' || !/^[a-f0-9-]{36}$/i.test(item.message_id) ||
      (item.sender_kind !== 'user' && item.sender_kind !== 'admin') ||
      typeof item.body !== 'string' || item.body.length > 2000 ||
      typeof item.created_at !== 'string' || Number.isNaN(Date.parse(item.created_at))) {
      throw new Error('Invalid transcript message');
    }
    const time = new Date(item.created_at).toISOString();
    rows.push([time, item.sender_kind, item.message_id, item.body,
      data.truncated ? 'MAX_500_UNVERIFIED' : 'BOUNDED_COMPLETE'].map(cell).join(','));
  }
  // A cap hit is explicitly flagged even if no row is returned by a broken provider.
  if (data.truncated && data.messages.length === 0) throw new Error('Invalid truncation flag');
  return '\uFEFF' + rows.join('\r\n') + '\r\n';
}
