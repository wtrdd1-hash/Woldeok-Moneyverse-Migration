import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { parseSwfEvidence } from '@/app/admin/treasury/swf-evidence';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = parseSwfEvidence(await api<unknown>('/api/v1/admin/treasury/swf'));
    if (!data) {
      return NextResponse.json(
        { code: 'SWF_EVIDENCE_UNVERIFIED', error: 'SWF evidence is unavailable or malformed.' },
        { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
      );
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status, headers: { 'Cache-Control': 'private, no-store' } });
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
