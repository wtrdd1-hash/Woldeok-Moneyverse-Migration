import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';

/**
 * Daily candles for one stock, for the detail dialog.
 *
 * The dialog opens on a click and is closed most of the time, so its data is
 * fetched when it opens rather than rendered into every market page — a year
 * of candles for every listed stock, on a page nobody has asked a question
 * about yet, is a lot of HTML to send for nothing.
 *
 * Members only, like the market itself: the API refuses the caller without a
 * session and this forwards their cookie rather than deciding anything.
 */
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  const data = await apiOrNull<unknown>(`/api/v1/stocks/${encodeURIComponent(id)}/candles`);
  if (!data) {
    return NextResponse.json(
      { detail: 'candles unavailable' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    );
  }
  return NextResponse.json(data, { headers: { 'cache-control': 'private, no-store' } });
}
