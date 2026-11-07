import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { supportTranscriptCsv, type TranscriptMessage } from '../csv';

type Context = { params: Promise<{ id: string }> };
type Transcript = { threadId: string; messages: TranscriptMessage[]; truncated: boolean };
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
function verifiedMessage(value: unknown): value is TranscriptMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return typeof message.message_id === 'string' && message.message_id.length > 0
    && (message.sender_kind === 'admin' || message.sender_kind === 'user')
    && typeof message.body === 'string'
    && typeof message.created_at === 'string'
    && Number.isFinite(Date.parse(message.created_at));
}

const PRIVATE_HEADERS = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex', 'x-content-type-options': 'nosniff' };

export async function GET(_request: Request, context: Context): Promise<Response> {
  const { id } = await context.params;
  if (!UUID.test(id)) return new Response('Invalid support thread', { status: 400, headers: PRIVATE_HEADERS });
  await requireMember();
  // Session-bound backend + SECURITY DEFINER function both enforce owner scope.
  const transcript = await api<Transcript>(`/api/v1/support/threads/${id}/transcript`);
  if (typeof transcript?.threadId !== 'string' || transcript.threadId.toLowerCase() !== id.toLowerCase()
    || typeof transcript.truncated !== 'boolean' || !Array.isArray(transcript.messages)
    || !transcript.messages.every(verifiedMessage)) {
    return new Response('Support transcript unavailable', { status: 502, headers: PRIVATE_HEADERS });
  }
  return new Response(supportTranscriptCsv(transcript.messages, transcript.truncated), {
    status: 200,
    headers: {
      ...PRIVATE_HEADERS,
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="support-transcript-${id.toLowerCase()}.csv"`,
    },
  });
}
