import { ApiError, api } from '@/lib/api';
import { activeSessionsCsv } from '../active-sessions-csv';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'cache-control': 'private, no-store, max-age=0',
  'x-robots-tag': 'noindex, nofollow',
  'x-content-type-options': 'nosniff',
};

export async function GET(): Promise<Response> {
  try {
    // The backend authenticates the session and derives the actor from its own guard.
    const snapshot = await api<unknown>('/api/v1/account/security/sessions/export');
    return new Response(activeSessionsCsv(snapshot), {
      status: 200,
      headers: {
        ...privateHeaders,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="moneyverse-active-sessions.csv"',
      },
    });
  } catch (error: unknown) {
    if (error instanceof ApiError && [401, 403, 428].includes(error.status)) {
      return new Response(null, { status: error.status, headers: privateHeaders });
    }
    return new Response(null, { status: 503, headers: privateHeaders });
  }
}
