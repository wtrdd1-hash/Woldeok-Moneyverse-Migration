import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await api('/api/v1/admin/treasury/swf');
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST() {
  // Do not forward unverified financial execution to an upstream service.
  return NextResponse.json(
    { error: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function PUT(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const data = await api('/api/v1/admin/treasury/swf/config', {
      method: 'PUT',
      body,
    });
    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status });
  }
}
