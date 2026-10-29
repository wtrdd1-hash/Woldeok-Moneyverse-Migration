/** Private, bounded support transcript export. Never expose raw member text to a spreadsheet formula parser. */
export interface TranscriptMessage {
  readonly message_id: string;
  readonly sender_kind: 'user' | 'admin';
  readonly created_at: string;
  readonly body: string;
}

function cell(value: string): string {
  // A CR/LF inside a quoted field can become a new formula-bearing spreadsheet row.
  const flat = value.replace(/[\r\n\t]/g, ' ');
  const safe = /^\s*[=+\-@]/.test(flat) ? `'${flat}` : flat;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function supportTranscriptCsv(messages: readonly TranscriptMessage[], truncated = false): string {
  const rows = ['message_id,sender,created_at,message'];
  for (const message of messages) {
    rows.push([message.message_id, message.sender_kind, message.created_at, message.body].map(cell).join(','));
  }
  if (truncated) rows.push([cell('NOTICE'), cell('system'), cell(''), cell('오래된 순으로 최대 500개 메시지만 포함됩니다. 이후 기록이 더 있을 수 있습니다.')].join(','));
  return `\uFEFF${rows.join('\r\n')}\r\n`;
}
