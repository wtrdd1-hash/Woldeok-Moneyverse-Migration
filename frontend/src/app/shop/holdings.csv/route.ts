import { NextResponse } from 'next/server';
import { ApiError, api } from '@/lib/api';
import { exportHoldingsCsv } from '../holdings-csv';

export const dynamic = 'force-dynamic';

const privateHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
  'X-Content-Type-Options': 'nosniff',
};

export async function GET(): Promise<Response> {
  try {
    const data = await api<{ holdings: unknown }>('/api/v1/shop/holdings/export');
    const csv = exportHoldingsCsv(data?.holdings);
    return new Response(csv, {
      status: 200,
      headers: {
        ...privateHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="moneyverse-shop-holdings.csv"',
      },
    });
  } catch (error: unknown) {
    const status = error instanceof ApiError && [401, 403, 428].includes(error.status)
      ? error.status
      : 503;
    return NextResponse.json(
      { error: 'verified holdings export is unavailable' },
      { status, headers: privateHeaders },
    );
  }
}
