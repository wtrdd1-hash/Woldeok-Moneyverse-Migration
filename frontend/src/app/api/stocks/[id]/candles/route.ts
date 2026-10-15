import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';

/**
 * Proxy candles without hiding input/permission failures behind a 503.
 * Stock identifiers must be non-nil UUIDs; the backend still decides if a
 * syntactically valid stock exists and whether the requested interval is valid.
 */
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NO_STORE = { 'cache-control': 'private, no-store' };

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  if (!UUID.test(id)) {
    return NextResponse.json({ detail: 'invalid stock identifier' }, { status: 400, headers: NO_STORE });
  }

  const interval = new URL(request.url).searchParams.get('interval');
  const query = interval ? '?interval=' + encodeURIComponent(interval) : '';
  try {
    const data = await api<unknown>('/api/v1/stocks/' + encodeURIComponent(id) + '/candles' + query);
    return NextResponse.json(data, { headers: NO_STORE });
  } catch (error) {
    if (error instanceof ApiError) {
      if ([400, 401, 403, 404, 429].includes(error.status)) {
        return NextResponse.json(
          { detail: error.status === 400 ? 'invalid candle request' : 'candles unavailable' },
          { status: error.status, headers: NO_STORE },
        );
      }
    }
    return NextResponse.json({ detail: 'candles temporarily unavailable' }, { status: 503, headers: NO_STORE });
  }
}
