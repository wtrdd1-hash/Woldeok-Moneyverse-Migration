import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await api('/api/v1/admin/treasury/swf');
    return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, {
      status,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}

/**
 * Fail closed: these operations currently have no ledger-verified settlement
 * or authenticated Test receipt. Never forward an SWF mutation from a browser.
 */
const financialHold = () =>
  NextResponse.json(
    { ok: false, error: 'swf_financial_settlement_not_verified' },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );

export async function POST() {
  return financialHold();
}

export async function PUT(_request: Request) {
  return financialHold();
}
