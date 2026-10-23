import { NextResponse } from 'next/server';

// This browser-accessible proxy cannot prove one-time CSRF ownership.
// Pension payouts now run exclusively through a same-origin server action.
export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint has been retired; use the administrator console action.' },
    { status: 410, headers: { 'Cache-Control': 'no-store' } },
  );
}
