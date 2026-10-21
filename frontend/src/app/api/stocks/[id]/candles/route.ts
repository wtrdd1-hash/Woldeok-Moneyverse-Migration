import { NextResponse } from 'next/server';
import { apiOrNull } from '@/lib/api';

export const dynamic = 'force-dynamic';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeInterval(val: string | null): string {
  if (!val) return '86400';
  if (/^\d+$/.test(val)) return val;
  const lower = val.toLowerCase();
  if (lower === '1m' || lower === 'm1') return '60';
  if (lower === '5m' || lower === 'm5') return '300';
  if (lower === '15m' || lower === 'm15') return '900';
  if (lower === '1h' || lower === 'h1' || lower === '60m') return '3600';
  if (lower === '1d' || lower === 'd1') return '86400';
  return '86400';
}

export async function GET(
  request: Request,
  context: { readonly params: Promise<{ readonly id: string }> },
): Promise<NextResponse> {
  const { id } = await context.params;
  const intervalParam = new URL(request.url).searchParams.get('interval');
  const normalizedInterval = normalizeInterval(intervalParam);
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
      { status: 503, headers: { 'cache-control': 'private, no-store' } },
    );
  }

  return NextResponse.json(data, { headers: { 'cache-control': 'private, no-store' } });
}
