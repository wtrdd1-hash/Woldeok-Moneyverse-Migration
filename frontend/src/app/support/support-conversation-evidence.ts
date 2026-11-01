/**
 * Owner scoping is enforced by Nest session guards and the PostgreSQL
 * support_my_threads/support_thread_messages functions. This parser only
 * prevents an unavailable or malformed successful response from being
 * presented as a verified conversation; it is not an authorization boundary.
 */
export type SupportThread = {
  readonly thread_id: string;
  readonly subject: string;
  readonly status: 'open' | 'waiting_user' | 'resolved';
  readonly created_at: string;
  readonly last_message_at: string;
};

export type SupportMessage = {
  readonly message_id: string;
  readonly sender_kind: 'user' | 'admin';
  readonly body: string;
  readonly created_at: string;
};

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function nonempty(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}

export function parseSupportThreads(payload: unknown): SupportThread[] | null {
  const envelope = record(payload);
  if (!Array.isArray(envelope?.threads) || envelope.threads.length > 100) return null;
  const result: SupportThread[] = [];
  const seen = new Set<string>();
  for (const entry of envelope.threads) {
    const row = record(entry);
    if (!row || !nonempty(row.thread_id, 128) || !nonempty(row.subject, 200) ||
      !['open', 'waiting_user', 'resolved'].includes(String(row.status)) ||
      typeof row.created_at !== 'string' || typeof row.last_message_at !== 'string' ||
      seen.has(row.thread_id)) return null;
    seen.add(row.thread_id);
    result.push(row as SupportThread);
  }
  return result;
}

export function parseSupportMessages(payload: unknown): SupportMessage[] | null {
  const envelope = record(payload);
  if (!Array.isArray(envelope?.messages) || envelope.messages.length > 500) return null;
  const result: SupportMessage[] = [];
  const seen = new Set<string>();
  for (const entry of envelope.messages) {
    const row = record(entry);
    if (!row || !nonempty(row.message_id, 128) ||
      (row.sender_kind !== 'user' && row.sender_kind !== 'admin') ||
      typeof row.body !== 'string' || row.body.length > 2000 ||
      typeof row.created_at !== 'string' || seen.has(row.message_id)) return null;
    seen.add(row.message_id);
    result.push(row as SupportMessage);
  }
  return result;
}
