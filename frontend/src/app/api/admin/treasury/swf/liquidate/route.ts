import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  // A stale backend still exposes a direct-vault mutation that lacks a matching
  // double-entry ledger debit. Never forward money movement until certification.
  return NextResponse.json(
    { error: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE' },
    { status: 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
