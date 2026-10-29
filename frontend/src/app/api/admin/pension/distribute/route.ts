import { NextResponse } from 'next/server';

/** The backend's P0 ledger hold also applies at the browser-facing BFF boundary. */
export async function POST() {
  return NextResponse.json({
    error: 'pension_ledger_settlement_uncertified',
    message: 'Pension payouts are paused pending funded, balanced ledger settlement.',
  }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } });
}
