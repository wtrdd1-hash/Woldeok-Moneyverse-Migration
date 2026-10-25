import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Mirror stock_candles' actual supported widths rather than silently sending
// 900-second requests that the PostgreSQL function rejects.
const SUPPORTED_INTERVALS = new Set(['60', '300', '1800', '3600', '7200', '14400', '86400', '604800']);
const CANDLE_HEADERS = { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow' };

function normalizeInterval(value: string | null): string | null {
  if (!value) return '86400';
  const lower = value.toLowerCase();
  const aliases: Readonly<Record<string, string>> = {
    '1m': '60', m1: '60', '5m': '300', m5: '300',
    '30m': '1800', m30: '1800', '1h': '3600', h1: '3600',
    '60m': '3600', '2h': '7200', '4h': '14400',
    '1d': '86400', d1: '86400', '1w': '604800',
  };
  const interval = aliases[lower] ?? lower;
  return SUPPORTED_INTERVALS.has(interval) ? interval : null;
}

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  const intervalParam = new URL(request.url).searchParams.get('interval');
  const normalizedInterval = normalizeInterval(intervalParam);
  if (normalizedInterval === null) {
    return NextResponse.json({ detail: 'unsupported candle interval' }, {
      status: 400, headers: CANDLE_HEADERS,
    });
  }
  const query = `?interval=${normalizedInterval}`;

  let targetId = id;

  // If not a UUID, resolve ticker symbol to UUID
  if (!UUID_REGEX.test(id)) {
    const stockList = await apiOrNull<{ stocks?: Array<{ id: string; symbol: string }> }>('/api/v1/stocks');
    if (stockList?.stocks) {
      const matched = stockList.stocks.find(
        (s) => s.symbol.toUpperCase() === id.toUpperCase() || s.id === id,
      );
      if (matched) {
        targetId = matched.id;
      }
    }
  }

  const data = await apiOrNull<unknown>(
    `/api/v1/stocks/${encodeURIComponent(targetId)}/candles${query}`,
  );

  if (!data) {
    return NextResponse.json(
      { detail: 'candles unavailable' },
      { status: 503, headers: CANDLE_HEADERS },
    );
  }

  return NextResponse.json(data, { headers: CANDLE_HEADERS });
}
