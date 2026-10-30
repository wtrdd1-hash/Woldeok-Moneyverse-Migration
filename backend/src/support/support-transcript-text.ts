import type { SupportMessageRow } from './support.repository';

// Plain text is not a terminal format: remove escape, bidirectional override and
// invisible C0 controls so a member's message cannot impersonate export metadata.
function safeLines(value: string): string {
  return value.replace(/\r\n?|[\u2028\u2029]/g, '\n')
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/\t/g, '    ')
    .split('\n').map((line) => `  | ${line}`).join('\n');
}

export function formatSupportTranscriptText(messages: readonly SupportMessageRow[], truncated: boolean): string {
  const lines = ['Support conversation transcript', 'Private member copy — at most 500 messages', ''];
  for (const message of messages) {
    const timestamp = new Date(message.created_at).toISOString();
    const sender = message.sender_kind === 'admin' ? 'ADMIN' : 'MEMBER';
    lines.push(`[${timestamp}] ${sender}`, safeLines(message.body), '');
  }
  if (truncated) {
    lines.push('NOTICE: This export may be incomplete. At most 500 messages are included; additional messages may exist.', '');
  }
  return `${lines.join('\n')}\n`;
}
