import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// No ledger-backed SWF liquidation receipt exists. Do not call the backend.
export async function POST(_request: Request) {
  return NextResponse.json(
    { ok: false, error: 'swf_financial_settlement_not_verified' },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
