import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';

/**
 * Candles for one stock at the requested width, for the detail dialog.
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
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  // Forwarded rather than interpreted: the API owns which widths exist, and a
  // second list here would be one to keep in step. An unsupported one comes
  // back as a 400 and lands in the branch below.
  const interval = new URL(request.url).searchParams.get('interval');
  const query = interval ? `?interval=${encodeURIComponent(interval)}` : '';
  const data = await apiOrNull<unknown>(
    `/api/v1/stocks/${encodeURIComponent(id)}/candles${query}`,
  );
  if (!data) {
    return NextResponse.json(
      { detail: 'candles unavailable' },
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    );
  }
  return NextResponse.json(data, { headers: { 'cache-control': 'private, no-store' } });
}
