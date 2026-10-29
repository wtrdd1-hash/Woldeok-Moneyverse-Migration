import { api } from '@/lib/api';
import { requireMember } from '@/lib/session';

type Context = { params: Promise<{ id: string }> };
type TextTranscript = { threadId: string; text: string; truncated: boolean };
const UUID = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store',
  'x-robots-tag': 'noindex',
  'x-content-type-options': 'nosniff',
};

export async function GET(_request: Request, context: Context): Promise<Response> {
  const { id } = await context.params;
  if (!UUID.test(id)) return new Response('Invalid support thread', { status: 400, headers: PRIVATE_HEADERS });
  await requireMember();
  // NestJS session and the PostgreSQL SECURITY DEFINER function independently scope the owner.
  const transcript = await api<TextTranscript>(`/api/v1/support/threads/${id}/transcript/text`);
  if (transcript.threadId?.toLowerCase() !== id.toLowerCase() || typeof transcript.text !== 'string' || typeof transcript.truncated !== 'boolean') {
    return new Response('Support transcript unavailable', { status: 502, headers: PRIVATE_HEADERS });
  }
  return new Response(transcript.text, {
    status: 200,
    headers: {
      ...PRIVATE_HEADERS,
      'content-type': 'text/plain; charset=utf-8',
      'content-disposition': `attachment; filename="support-transcript-${id.toLowerCase()}.txt"`,
    },
  });
}
