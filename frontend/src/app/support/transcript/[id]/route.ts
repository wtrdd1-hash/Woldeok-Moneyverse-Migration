import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';
import { supportTranscriptCsv, type TranscriptMessage } from '../csv';

type Context = { params: Promise<{ id: string }> };
type Transcript = { threadId: string; messages: TranscriptMessage[]; truncated: boolean };
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const PRIVATE_HEADERS = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex', 'x-content-type-options': 'nosniff' };

export async function GET(_request: Request, context: Context): Promise<Response> {
  const { id } = await context.params;
  if (!UUID.test(id)) return new Response('Invalid support thread', { status: 400, headers: PRIVATE_HEADERS });
  await requireMember();
  // Session-bound backend + SECURITY DEFINER function both enforce owner scope.
  const transcript = await api<Transcript>(`/api/v1/support/threads/${id}/transcript`);
  if (transcript.threadId.toLowerCase() !== id.toLowerCase() || !Array.isArray(transcript.messages)) {
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
