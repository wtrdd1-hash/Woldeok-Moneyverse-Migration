import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { serializeCasinoHistory } from './csv';

export const dynamic = 'force-dynamic';

const PRIVATE_HEADERS = {
  'cache-control': 'private, no-store, max-age=0',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'noindex, nofollow',
} as const;

/** Only a session-authenticated API response may produce a downloadable receipt. */
export async function GET(): Promise<NextResponse> {
  try {
    const history = await api<unknown>('/api/v1/casino/history?limit=100');
    const csv = serializeCasinoHistory(history);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="moneyverse-coin-dice-history.csv"',
      },
    });
  } catch (error: unknown) {
    const status = error instanceof ApiError && (error.status === 401 || error.status === 403)
      ? error.status
      : 503;
    return NextResponse.json(
      { code: 'casino_history_export_unavailable', message: 'Verified history could not be exported' },
      { status, headers: PRIVATE_HEADERS },
    );
  }
}
