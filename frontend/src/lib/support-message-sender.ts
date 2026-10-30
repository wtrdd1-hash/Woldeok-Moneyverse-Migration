/** Fail closed when a filtered private support response cannot be verified. */
export type SupportSender = 'admin' | 'user';
export type SupportSenderMessage = {
  readonly message_id: string;
  readonly sender_kind: SupportSender;
  readonly body: string;
  readonly created_at: string;
};
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function parseSupportSenderMessages(value: unknown, sender: SupportSender): SupportSenderMessage[] | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const messages = (value as { messages?: unknown }).messages;
  if (!Array.isArray(messages) || messages.length > 200) return null;
  const seen = new Set<string>();
  let previous = -Infinity;
  const verified: SupportSenderMessage[] = [];
  for (const item of messages) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (typeof row.message_id !== 'string' || !UUID.test(row.message_id) || seen.has(row.message_id) ||
        row.sender_kind !== sender || typeof row.body !== 'string' || row.body.length > 2000 ||
        typeof row.created_at !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(row.created_at)) return null;
    const time = Date.parse(row.created_at);
    if (!Number.isFinite(time) || time < previous) return null;
    previous = time;
    seen.add(row.message_id);
    verified.push(row as SupportSenderMessage);
  }
  return verified;
}
