import { NextResponse } from 'next/server';
import { api } from '@/lib/api';
import { viewerOrUnknown } from '@/lib/viewer';
import { stockHoldingsCsv } from '@/app/stocks/portfolio/stock-holdings-csv';

export const dynamic = 'force-dynamic';
const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};

export async function GET(): Promise<Response> {
  const viewer = await viewerOrUnknown().catch(() => null);
  if (!viewer) return NextResponse.json({ error: 'Authentication unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  if (!viewer.signedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: PRIVATE_HEADERS });
  try {
    const snapshot = await api<unknown>('/api/v1/stocks/portfolio/export');
    const csv = stockHoldingsCsv(snapshot);
    return new Response(csv, {
      status: 200,
      headers: {
        ...PRIVATE_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="moneyverse-current-stock-holdings.csv"',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Verified stock holdings unavailable' }, { status: 503, headers: PRIVATE_HEADERS });
  }
}
