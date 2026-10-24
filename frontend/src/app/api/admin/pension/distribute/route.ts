import { NextResponse } from 'next/server';

// The pension repository deliberately refuses unjournaled WLD payouts.
// Keep this browser-facing proxy closed until ledger settlement and
// elevated administrator CSRF/reauth flows have been certified together.
export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: 'PENSION_LEDGER_SETTLEMENT_UNCERTIFIED',
      error: 'Pension payouts are paused pending authoritative ledger verification.',
    },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}
