import { ApiError, api } from '@/lib/api';
import { supportTranscriptCsv } from '../../../support-transcript-csv';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'cache-control': 'private, no-store, max-age=0',
  'x-robots-tag': 'noindex, nofollow',
  'x-content-type-options': 'nosniff',
};

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context): Promise<Response> {
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return new Response(null, { status: 404, headers: privateHeaders });
  }
  try {
    // Backend guards and the SECURITY DEFINER function, not this route, own authorization.
    const transcript = await api<unknown>(`/api/v1/support/threads/${id}/transcript`);
    const csv = supportTranscriptCsv(transcript);
    return new Response(csv, {
      status: 200,
      headers: {
        ...privateHeaders,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': `attachment; filename="moneyverse-support-${id}.csv"`,
      },
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && [401, 403, 404, 428].includes(error.status)) {
      return new Response(null, { status: error.status, headers: privateHeaders });
    }
    return new Response(null, { status: 503, headers: privateHeaders });
  }
}
