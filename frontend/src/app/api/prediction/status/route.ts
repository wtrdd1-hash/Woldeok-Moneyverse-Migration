import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// No verified prediction market or ledger settlement contract exists in the backend.
// Fail closed rather than inventing market quotes, bets, or transaction receipts.
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { available: false, reason: 'NO_SETTLEMENT_CONTRACT', markets: [] },
    { status: 503, headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  );
}
