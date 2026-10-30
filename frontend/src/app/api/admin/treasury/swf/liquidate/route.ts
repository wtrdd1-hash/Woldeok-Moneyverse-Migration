import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  // A successful API call is not evidence of an immutable SWF ledger settlement.
  return NextResponse.json(
    { error: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
